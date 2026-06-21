<?php
/**
 * Builds an NNAuto vehicle payload from a WordPress post using the configured
 * field map.
 *
 * @package NNAuto_Sync
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class NNAuto_Mapper {

	/** @var array */
	private $settings;

	/** Fields that NNAuto expects as arrays of strings. */
	const ARRAY_FIELDS = array( 'fuelType', 'transmission', 'driveType' );

	/** Integer fields. */
	const INT_FIELDS = array( 'year', 'mileage', 'power', 'doors', 'seats' );

	public function __construct( $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Stable external id for a post.
	 *
	 * @param int $post_id Post id.
	 * @return string
	 */
	public function external_id( $post_id ) {
		return 'wp-' . (int) $post_id;
	}

	/**
	 * Resolve a single source token to a raw string value.
	 *
	 * @param WP_Post $post  Post.
	 * @param string  $token Source token.
	 * @return string
	 */
	private function resolve( $post, $token ) {
		$token = (string) $token;
		if ( '' === $token ) {
			return '';
		}
		if ( 'title' === $token ) {
			return (string) $post->post_title;
		}
		if ( 'content' === $token ) {
			return trim( wp_strip_all_tags( (string) $post->post_content ) );
		}
		if ( 0 === strpos( $token, 'meta:' ) ) {
			$key = substr( $token, 5 );
			$val = get_post_meta( $post->ID, $key, true );
			if ( is_array( $val ) ) {
				$val = implode( ',', array_map( 'strval', $val ) );
			}
			return is_scalar( $val ) ? (string) $val : '';
		}
		if ( 0 === strpos( $token, 'tax:' ) ) {
			$taxonomy = substr( $token, 4 );
			$terms    = wp_get_post_terms( $post->ID, $taxonomy, array( 'fields' => 'names' ) );
			if ( is_wp_error( $terms ) || empty( $terms ) ) {
				return '';
			}
			return implode( ',', $terms );
		}
		// Literal value.
		return $token;
	}

	/**
	 * Collect image URLs: featured image first, then attached images.
	 *
	 * @param WP_Post $post Post.
	 * @return string[]
	 */
	private function collect_photos( $post ) {
		$photos = array();

		$thumb_id = get_post_thumbnail_id( $post->ID );
		if ( $thumb_id ) {
			$url = wp_get_attachment_image_url( $thumb_id, 'full' );
			if ( $url ) {
				$photos[] = $url;
			}
		}

		$attached = get_attached_media( 'image', $post->ID );
		foreach ( $attached as $media ) {
			$url = wp_get_attachment_image_url( $media->ID, 'full' );
			if ( $url ) {
				$photos[] = $url;
			}
		}

		return array_values( array_unique( array_filter( $photos ) ) );
	}

	/**
	 * Build the NNAuto payload for a post. Returns an array, or a WP_Error when a
	 * hard-required field (brand/model/year/price) is missing.
	 *
	 * @param WP_Post $post Post.
	 * @return array|WP_Error
	 */
	public function build_payload( $post ) {
		$map     = $this->settings['map'];
		$payload = array();

		foreach ( $map as $field => $token ) {
			$raw = $this->resolve( $post, $token );

			if ( in_array( $field, self::ARRAY_FIELDS, true ) ) {
				$parts = array_filter( array_map( 'trim', explode( ',', strtolower( $raw ) ) ) );
				if ( ! empty( $parts ) ) {
					$payload[ $field ] = array_values( $parts );
				}
				continue;
			}

			if ( in_array( $field, self::INT_FIELDS, true ) ) {
				$digits = preg_replace( '/[^0-9]/', '', $raw );
				if ( '' !== $digits ) {
					$payload[ $field ] = (int) $digits;
				}
				continue;
			}

			if ( 'price' === $field ) {
				$digits = preg_replace( '/[^0-9]/', '', $raw );
				if ( '' !== $digits ) {
					$payload['price'] = (string) (int) $digits;
				}
				continue;
			}

			if ( 'vin' === $field ) {
				$vin = strtoupper( trim( $raw ) );
				// NNAuto rejects malformed VINs, so only send a valid one.
				if ( preg_match( '/^[A-HJ-NPR-Z0-9]{17}$/', $vin ) ) {
					$payload['vin'] = $vin;
				}
				continue;
			}

			if ( '' !== $raw ) {
				$payload[ $field ] = $raw;
			}
		}

		// Required-field guard.
		$missing = array();
		foreach ( array( 'brand', 'model', 'year', 'price' ) as $req ) {
			if ( empty( $payload[ $req ] ) ) {
				$missing[] = $req;
			}
		}
		if ( ! empty( $missing ) ) {
			return new WP_Error( 'nnauto_missing', 'Chybí povinná pole: ' . implode( ', ', $missing ) );
		}

		// Sensible defaults / fallbacks.
		$payload['externalId'] = $this->external_id( $post->ID );
		$payload['sellerType'] = 'dealer';
		$payload['source']     = 'wordpress';

		if ( empty( $payload['title'] ) ) {
			$payload['title'] = trim( $payload['brand'] . ' ' . $payload['model'] . ' ' . $payload['year'] );
		}
		if ( empty( $payload['description'] ) ) {
			$payload['description'] = $payload['title'];
		}
		if ( empty( $payload['condition'] ) ) {
			$payload['condition'] = 'used';
		}
		if ( empty( $payload['vehicleType'] ) ) {
			$payload['vehicleType'] = 'osobni-auta';
		}
		if ( empty( $payload['color'] ) ) {
			$payload['color'] = 'neuvedeno';
		}
		if ( empty( $payload['engineVolume'] ) ) {
			$payload['engineVolume'] = '0';
		}
		if ( empty( $payload['power'] ) ) {
			$payload['power'] = 1;
		}
		if ( empty( $payload['mileage'] ) ) {
			$payload['mileage'] = 0;
		}
		if ( empty( $payload['fuelType'] ) ) {
			$payload['fuelType'] = array( 'benzin' );
		}
		if ( empty( $payload['transmission'] ) ) {
			$payload['transmission'] = array( 'manual' );
		}
		if ( empty( $payload['driveType'] ) ) {
			$payload['driveType'] = array( 'fwd' );
		}
		if ( empty( $payload['region'] ) ) {
			$payload['region'] = $this->settings['default_region'] ? $this->settings['default_region'] : 'Praha';
		}
		if ( empty( $payload['phone'] ) ) {
			$payload['phone'] = $this->settings['default_phone'] ? $this->settings['default_phone'] : '000000000';
		}

		$photos = $this->collect_photos( $post );
		if ( ! empty( $photos ) ) {
			$payload['photos'] = $photos;
		}

		return $payload;
	}
}
