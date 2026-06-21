<?php
/**
 * Thin HTTP client for the NNAuto dealer API.
 *
 * @package NNAuto_Sync
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class NNAuto_Client {

	/** @var string */
	private $base_url;

	/** @var string */
	private $api_key;

	public function __construct( $base_url, $api_key ) {
		$this->base_url = untrailingslashit( trim( (string) $base_url ) );
		$this->api_key  = trim( (string) $api_key );
	}

	public function is_configured() {
		return '' !== $this->base_url && '' !== $this->api_key;
	}

	/**
	 * Perform a request against the dealer API.
	 *
	 * @param string     $method HTTP method.
	 * @param string     $path   Path beginning with /api/...
	 * @param array|null $body   Optional JSON body.
	 * @return array { ok: bool, status: int, data: mixed, error: string }
	 */
	public function request( $method, $path, $body = null ) {
		if ( ! $this->is_configured() ) {
			return array( 'ok' => false, 'status' => 0, 'data' => null, 'error' => 'API key / URL not configured' );
		}

		$args = array(
			'method'  => $method,
			'timeout' => 30,
			'headers' => array(
				'Authorization' => 'Bearer ' . $this->api_key,
				'Content-Type'  => 'application/json',
				'Accept'        => 'application/json',
			),
		);

		if ( null !== $body ) {
			$args['body'] = wp_json_encode( $body );
		}

		$response = wp_remote_request( $this->base_url . $path, $args );

		if ( is_wp_error( $response ) ) {
			return array( 'ok' => false, 'status' => 0, 'data' => null, 'error' => $response->get_error_message() );
		}

		$status = (int) wp_remote_retrieve_response_code( $response );
		$raw    = wp_remote_retrieve_body( $response );
		$data   = json_decode( $raw, true );
		$ok     = $status >= 200 && $status < 300;
		$error  = $ok ? '' : ( isset( $data['error'] ) ? $data['error'] : ( 'HTTP ' . $status ) );

		return array( 'ok' => $ok, 'status' => $status, 'data' => $data, 'error' => $error );
	}

	public function test_connection() {
		return $this->request( 'GET', '/api/dealer/vehicles' );
	}

	public function upsert_vehicle( $payload ) {
		return $this->request( 'POST', '/api/dealer/vehicles', $payload );
	}

	public function delete_vehicle( $external_id ) {
		return $this->request( 'DELETE', '/api/dealer/vehicles/ext:' . rawurlencode( $external_id ) );
	}

	public function set_status( $external_id, $is_sold ) {
		return $this->request(
			'PATCH',
			'/api/dealer/vehicles/ext:' . rawurlencode( $external_id ) . '/status',
			array( 'isSold' => (bool) $is_sold )
		);
	}
}
