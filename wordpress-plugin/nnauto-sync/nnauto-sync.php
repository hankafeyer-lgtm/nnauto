<?php
/**
 * Plugin Name:       NNAuto Sync
 * Plugin URI:        https://nnauto.cz
 * Description:       Automaticky synchronizuje vozidla z vašeho WordPressu do marketplace NNAuto přes oficiální API. / Automatically syncs vehicles from your WordPress to the NNAuto marketplace via the official API.
 * Version:           1.0.0
 * Author:            NNAuto
 * Author URI:        https://nnauto.cz
 * License:           GPL-2.0-or-later
 * Text Domain:       nnauto-sync
 *
 * @package NNAuto_Sync
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

define( 'NNAUTO_SYNC_VERSION', '1.0.0' );
define( 'NNAUTO_SYNC_FILE', __FILE__ );
define( 'NNAUTO_SYNC_DIR', plugin_dir_path( __FILE__ ) );
define( 'NNAUTO_SYNC_OPTION', 'nnauto_sync_settings' );

require_once NNAUTO_SYNC_DIR . 'includes/class-nnauto-client.php';
require_once NNAUTO_SYNC_DIR . 'includes/class-nnauto-mapper.php';
require_once NNAUTO_SYNC_DIR . 'includes/class-nnauto-settings.php';
require_once NNAUTO_SYNC_DIR . 'includes/class-nnauto-sync.php';

/**
 * Default plugin settings.
 *
 * @return array
 */
function nnauto_sync_default_settings() {
	return array(
		'api_key'        => '',
		'base_url'       => 'https://nnauto.cz',
		'post_type'      => 'post',
		'auto_sync'      => 1,
		'sold_on_trash'  => 1,
		'default_region' => '',
		'default_phone'  => '',
		// Field map: NNAuto field => source token.
		// Sources: "title" (post_title), "content" (post_content),
		// "meta:<key>", "tax:<taxonomy>", or a literal value.
		'map'            => array(
			'title'         => 'title',
			'description'   => 'content',
			'brand'         => 'meta:brand',
			'model'         => 'meta:model',
			'year'          => 'meta:year',
			'mileage'       => 'meta:mileage',
			'price'         => 'meta:price',
			'fuelType'      => 'meta:fuel',
			'transmission'  => 'meta:transmission',
			'driveType'     => 'meta:drive',
			'bodyType'      => 'meta:body',
			'color'         => 'meta:color',
			'engineVolume'  => 'meta:engine_volume',
			'power'         => 'meta:power',
			'condition'     => 'meta:condition',
			'vehicleType'   => 'meta:vehicle_type',
			'vin'           => 'meta:vin',
			'phone'         => 'meta:phone',
			'region'        => 'meta:region',
		),
	);
}

/**
 * Read merged settings.
 *
 * @return array
 */
function nnauto_sync_get_settings() {
	$saved    = get_option( NNAUTO_SYNC_OPTION, array() );
	$defaults = nnauto_sync_default_settings();
	$settings = wp_parse_args( is_array( $saved ) ? $saved : array(), $defaults );
	$settings['map'] = wp_parse_args(
		isset( $settings['map'] ) && is_array( $settings['map'] ) ? $settings['map'] : array(),
		$defaults['map']
	);
	return $settings;
}

/**
 * Boot the plugin.
 */
function nnauto_sync_init() {
	$settings = nnauto_sync_get_settings();
	$client   = new NNAuto_Client( $settings['base_url'], $settings['api_key'] );
	$mapper   = new NNAuto_Mapper( $settings );

	new NNAuto_Settings( $client );
	new NNAuto_Sync( $client, $mapper, $settings );
}
add_action( 'plugins_loaded', 'nnauto_sync_init' );
