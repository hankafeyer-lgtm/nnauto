<?php
/**
 * Admin settings page for NNAuto Sync.
 *
 * @package NNAuto_Sync
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class NNAuto_Settings {

	/** @var NNAuto_Client */
	private $client;

	/** Editable NNAuto fields shown in the mapping table. */
	const MAP_FIELDS = array(
		'title'        => 'Název / Title',
		'description'  => 'Popis / Description',
		'brand'        => 'Značka / Brand *',
		'model'        => 'Model *',
		'year'         => 'Rok / Year *',
		'price'        => 'Cena / Price *',
		'mileage'      => 'Najeto / Mileage',
		'fuelType'     => 'Palivo / Fuel',
		'transmission' => 'Převodovka / Transmission',
		'driveType'    => 'Pohon / Drive',
		'bodyType'     => 'Karoserie / Body',
		'color'        => 'Barva / Color',
		'engineVolume' => 'Objem / Engine volume',
		'power'        => 'Výkon / Power (kW)',
		'condition'    => 'Stav / Condition',
		'vehicleType'  => 'Typ / Vehicle type',
		'vin'          => 'VIN',
		'phone'        => 'Telefon / Phone',
		'region'       => 'Region',
	);

	public function __construct( $client ) {
		$this->client = $client;
		add_action( 'admin_menu', array( $this, 'add_menu' ) );
		add_action( 'admin_init', array( $this, 'register' ) );
		add_action( 'admin_post_nnauto_test', array( $this, 'handle_test' ) );
		add_action( 'admin_post_nnauto_sync_all', array( $this, 'handle_sync_all' ) );
		add_action( 'admin_notices', array( $this, 'maybe_notice' ) );
	}

	public function add_menu() {
		add_menu_page(
			'NNAuto Sync',
			'NNAuto Sync',
			'manage_options',
			'nnauto-sync',
			array( $this, 'render_page' ),
			'dashicons-car',
			58
		);
	}

	public function register() {
		register_setting( 'nnauto_sync_group', NNAUTO_SYNC_OPTION, array( $this, 'sanitize' ) );
	}

	/**
	 * Sanitize submitted settings.
	 *
	 * @param array $input Raw input.
	 * @return array
	 */
	public function sanitize( $input ) {
		$defaults = nnauto_sync_default_settings();
		$out      = array();

		$out['api_key']        = isset( $input['api_key'] ) ? sanitize_text_field( $input['api_key'] ) : '';
		$out['base_url']       = isset( $input['base_url'] ) ? esc_url_raw( $input['base_url'] ) : $defaults['base_url'];
		$out['post_type']      = isset( $input['post_type'] ) ? sanitize_key( $input['post_type'] ) : 'post';
		$out['auto_sync']      = empty( $input['auto_sync'] ) ? 0 : 1;
		$out['sold_on_trash']  = empty( $input['sold_on_trash'] ) ? 0 : 1;
		$out['default_region'] = isset( $input['default_region'] ) ? sanitize_text_field( $input['default_region'] ) : '';
		$out['default_phone']  = isset( $input['default_phone'] ) ? sanitize_text_field( $input['default_phone'] ) : '';

		$out['map'] = array();
		$map_in     = isset( $input['map'] ) && is_array( $input['map'] ) ? $input['map'] : array();
		foreach ( array_keys( self::MAP_FIELDS ) as $field ) {
			$out['map'][ $field ] = isset( $map_in[ $field ] ) ? sanitize_text_field( $map_in[ $field ] ) : '';
		}

		return $out;
	}

	private function build_sync() {
		$settings = nnauto_sync_get_settings();
		$client   = new NNAuto_Client( $settings['base_url'], $settings['api_key'] );
		$mapper   = new NNAuto_Mapper( $settings );
		return new NNAuto_Sync( $client, $mapper, $settings );
	}

	public function handle_test() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Forbidden' );
		}
		check_admin_referer( 'nnauto_test' );
		$res = $this->client->test_connection();
		$msg = $res['ok']
			? 'ok:Spojení funguje / Connection OK'
			: 'err:' . ( isset( $res['error'] ) ? $res['error'] : 'Neznámá chyba' );
		set_transient( 'nnauto_notice_' . get_current_user_id(), $msg, 60 );
		wp_safe_redirect( admin_url( 'admin.php?page=nnauto-sync' ) );
		exit;
	}

	public function handle_sync_all() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Forbidden' );
		}
		check_admin_referer( 'nnauto_sync_all' );
		$sync = $this->build_sync();
		$r    = $sync->sync_all();
		$msg  = sprintf( 'ok:Synchronizováno %d/%d, chyby: %d', (int) $r['ok'], (int) $r['total'], (int) $r['failed'] );
		set_transient( 'nnauto_notice_' . get_current_user_id(), $msg, 60 );
		wp_safe_redirect( admin_url( 'admin.php?page=nnauto-sync' ) );
		exit;
	}

	public function maybe_notice() {
		$key    = 'nnauto_notice_' . get_current_user_id();
		$notice = get_transient( $key );
		if ( ! $notice ) {
			return;
		}
		delete_transient( $key );
		$is_ok = 0 === strpos( $notice, 'ok:' );
		$text  = substr( $notice, $is_ok ? 3 : 4 );
		printf(
			'<div class="notice notice-%s is-dismissible"><p>%s</p></div>',
			$is_ok ? 'success' : 'error',
			esc_html( $text )
		);
	}

	public function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$s          = nnauto_sync_get_settings();
		$post_types = get_post_types( array( 'public' => true ), 'objects' );
		?>
		<div class="wrap">
			<h1>NNAuto Sync</h1>
			<p>Synchronizujte vozidla z WordPressu do marketplace NNAuto. / Sync your vehicles to the NNAuto marketplace.</p>

			<form method="post" action="options.php">
				<?php settings_fields( 'nnauto_sync_group' ); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><label for="nnauto_api_key">API klíč / API key</label></th>
						<td>
							<input type="text" id="nnauto_api_key" class="regular-text"
								name="<?php echo esc_attr( NNAUTO_SYNC_OPTION ); ?>[api_key]"
								value="<?php echo esc_attr( $s['api_key'] ); ?>" placeholder="nn_live_..." />
							<p class="description">Najdete v kabinetu dealera → Import vozidel → API.</p>
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="nnauto_base_url">NNAuto URL</label></th>
						<td>
							<input type="url" id="nnauto_base_url" class="regular-text"
								name="<?php echo esc_attr( NNAUTO_SYNC_OPTION ); ?>[base_url]"
								value="<?php echo esc_attr( $s['base_url'] ); ?>" />
						</td>
					</tr>
					<tr>
						<th scope="row"><label for="nnauto_post_type">Typ záznamu / Post type</label></th>
						<td>
							<select id="nnauto_post_type" name="<?php echo esc_attr( NNAUTO_SYNC_OPTION ); ?>[post_type]">
								<?php foreach ( $post_types as $pt ) : ?>
									<option value="<?php echo esc_attr( $pt->name ); ?>" <?php selected( $s['post_type'], $pt->name ); ?>>
										<?php echo esc_html( $pt->labels->singular_name . ' (' . $pt->name . ')' ); ?>
									</option>
								<?php endforeach; ?>
							</select>
							<p class="description">Který typ obsahu představuje vozidla. / Which content type represents vehicles.</p>
						</td>
					</tr>
					<tr>
						<th scope="row">Automatika / Automation</th>
						<td>
							<label><input type="checkbox" name="<?php echo esc_attr( NNAUTO_SYNC_OPTION ); ?>[auto_sync]" value="1" <?php checked( $s['auto_sync'], 1 ); ?> /> Synchronizovat při uložení / Sync on save</label><br />
							<label><input type="checkbox" name="<?php echo esc_attr( NNAUTO_SYNC_OPTION ); ?>[sold_on_trash]" value="1" <?php checked( $s['sold_on_trash'], 1 ); ?> /> Při přesunu do koše označit jako prodané (jinak smazat) / Mark sold on trash (else delete)</label>
						</td>
					</tr>
					<tr>
						<th scope="row">Výchozí hodnoty / Defaults</th>
						<td>
							<input type="text" class="regular-text" placeholder="Region (např. Praha)"
								name="<?php echo esc_attr( NNAUTO_SYNC_OPTION ); ?>[default_region]"
								value="<?php echo esc_attr( $s['default_region'] ); ?>" /><br /><br />
							<input type="text" class="regular-text" placeholder="Telefon / Phone"
								name="<?php echo esc_attr( NNAUTO_SYNC_OPTION ); ?>[default_phone]"
								value="<?php echo esc_attr( $s['default_phone'] ); ?>" />
							<p class="description">Použije se, když v záznamu chybí region/telefon.</p>
						</td>
					</tr>
				</table>

				<h2>Mapování polí / Field mapping</h2>
				<p class="description">
					Zdroj: <code>title</code> = nadpis, <code>content</code> = obsah,
					<code>meta:klíč</code> = vlastní pole, <code>tax:taxonomie</code> = taxonomie,
					nebo pevná hodnota. (* = povinné)
				</p>
				<table class="form-table" role="presentation">
					<?php foreach ( self::MAP_FIELDS as $field => $label ) : ?>
						<tr>
							<th scope="row"><label><?php echo esc_html( $label ); ?></label></th>
							<td>
								<input type="text" class="regular-text"
									name="<?php echo esc_attr( NNAUTO_SYNC_OPTION ); ?>[map][<?php echo esc_attr( $field ); ?>]"
									value="<?php echo esc_attr( isset( $s['map'][ $field ] ) ? $s['map'][ $field ] : '' ); ?>" />
							</td>
						</tr>
					<?php endforeach; ?>
				</table>

				<?php submit_button( 'Uložit nastavení / Save settings' ); ?>
			</form>

			<hr />
			<h2>Akce / Actions</h2>
			<div style="display:flex; gap:12px; flex-wrap:wrap;">
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
					<input type="hidden" name="action" value="nnauto_test" />
					<?php wp_nonce_field( 'nnauto_test' ); ?>
					<?php submit_button( 'Otestovat spojení / Test connection', 'secondary', 'submit', false ); ?>
				</form>
				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
					<input type="hidden" name="action" value="nnauto_sync_all" />
					<?php wp_nonce_field( 'nnauto_sync_all' ); ?>
					<?php submit_button( 'Synchronizovat všechna vozidla / Sync all vehicles', 'primary', 'submit', false ); ?>
				</form>
			</div>
		</div>
		<?php
	}
}
