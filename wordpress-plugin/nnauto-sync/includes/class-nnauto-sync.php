<?php
/**
 * Wires WordPress post lifecycle events to the NNAuto API.
 *
 * @package NNAuto_Sync
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class NNAuto_Sync {

	/** @var NNAuto_Client */
	private $client;

	/** @var NNAuto_Mapper */
	private $mapper;

	/** @var array */
	private $settings;

	public function __construct( $client, $mapper, $settings ) {
		$this->client   = $client;
		$this->mapper   = $mapper;
		$this->settings = $settings;

		if ( ! empty( $settings['auto_sync'] ) ) {
			add_action( 'save_post', array( $this, 'on_save_post' ), 20, 3 );
			add_action( 'transition_post_status', array( $this, 'on_transition_status' ), 20, 3 );
		}
		add_action( 'wp_trash_post', array( $this, 'on_trash' ) );
		add_action( 'before_delete_post', array( $this, 'on_delete' ) );
	}

	private function is_target_post( $post ) {
		return $post && $post->post_type === $this->settings['post_type'];
	}

	/**
	 * Push a single post to NNAuto. Returns result array or WP_Error.
	 *
	 * @param int $post_id Post id.
	 * @return array|WP_Error
	 */
	public function sync_post( $post_id ) {
		$post = get_post( $post_id );
		if ( ! $this->is_target_post( $post ) ) {
			return new WP_Error( 'nnauto_skip', 'Not a target post type' );
		}
		$payload = $this->mapper->build_payload( $post );
		if ( is_wp_error( $payload ) ) {
			return $payload;
		}
		return $this->client->upsert_vehicle( $payload );
	}

	public function on_save_post( $post_id, $post, $update ) {
		if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
			return;
		}
		if ( ! $this->is_target_post( $post ) ) {
			return;
		}
		if ( 'publish' !== $post->post_status ) {
			return;
		}
		$this->sync_post( $post_id );
	}

	/**
	 * When a published vehicle becomes draft/pending, mark it as sold (hidden)
	 * on NNAuto instead of deleting it.
	 */
	public function on_transition_status( $new_status, $old_status, $post ) {
		if ( ! $this->is_target_post( $post ) ) {
			return;
		}
		if ( 'publish' === $old_status && 'publish' !== $new_status && 'trash' !== $new_status ) {
			$this->client->set_status( $this->mapper->external_id( $post->ID ), true );
		}
	}

	public function on_trash( $post_id ) {
		$post = get_post( $post_id );
		if ( ! $this->is_target_post( $post ) ) {
			return;
		}
		if ( ! empty( $this->settings['sold_on_trash'] ) ) {
			$this->client->set_status( $this->mapper->external_id( $post_id ), true );
		} else {
			$this->client->delete_vehicle( $this->mapper->external_id( $post_id ) );
		}
	}

	public function on_delete( $post_id ) {
		$post = get_post( $post_id );
		if ( ! $this->is_target_post( $post ) ) {
			return;
		}
		$this->client->delete_vehicle( $this->mapper->external_id( $post_id ) );
	}

	/**
	 * Push every published post of the target type.
	 *
	 * @return array { total: int, ok: int, failed: int, errors: string[] }
	 */
	public function sync_all() {
		$result = array( 'total' => 0, 'ok' => 0, 'failed' => 0, 'errors' => array() );

		$paged = 1;
		do {
			$query = new WP_Query(
				array(
					'post_type'      => $this->settings['post_type'],
					'post_status'    => 'publish',
					'posts_per_page' => 50,
					'paged'          => $paged,
					'fields'         => 'ids',
					'no_found_rows'  => false,
				)
			);

			if ( empty( $query->posts ) ) {
				break;
			}

			foreach ( $query->posts as $post_id ) {
				$result['total']++;
				$res = $this->sync_post( $post_id );
				if ( is_wp_error( $res ) ) {
					$result['failed']++;
					if ( count( $result['errors'] ) < 50 ) {
						$result['errors'][] = '#' . $post_id . ': ' . $res->get_error_message();
					}
				} elseif ( ! empty( $res['ok'] ) ) {
					$result['ok']++;
				} else {
					$result['failed']++;
					if ( count( $result['errors'] ) < 50 ) {
						$result['errors'][] = '#' . $post_id . ': ' . ( isset( $res['error'] ) ? $res['error'] : 'unknown' );
					}
				}
			}

			$paged++;
		} while ( $paged <= (int) $query->max_num_pages );

		return $result;
	}
}
