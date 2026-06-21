=== NNAuto Sync ===
Contributors: nnauto
Tags: cars, vehicles, marketplace, sync, nnauto
Requires at least: 5.6
Tested up to: 6.6
Requires PHP: 7.2
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Automatically syncs vehicles from your WordPress site to the NNAuto marketplace via the official NNAuto dealer API.

== Description ==

NNAuto Sync lets car dealers push their inventory from WordPress to the NNAuto
marketplace (nnauto.cz) automatically. It uses the official NNAuto dealer API,
so no manual XML/CSV work is needed.

Features:

* Pick which post type represents your vehicles.
* Map your fields (custom fields / taxonomies / title / content) to NNAuto fields.
* Auto-sync on publish/update (idempotent — re-syncing never creates duplicates).
* Mark vehicles as sold (or delete) when moved to trash.
* One-click "Sync all vehicles".
* Featured image + attached images are sent as the listing photos.

== Installation ==

1. In WordPress admin go to Plugins → Add New → Upload Plugin and upload
   `nnauto-sync.zip`, then Activate.
2. Open the new "NNAuto Sync" menu item.
3. Paste your API key (Dealer cabinet → Import vozidel → API → Generate New Key).
4. Choose the post type that represents your cars and map the fields.
5. Save. Click "Test connection", then "Sync all vehicles".

== How matching works ==

Each WordPress post is sent with `externalId = wp-<post_id>`. NNAuto upserts by
this id, so editing a post updates the same listing instead of creating a new
one. Trashing/deleting a post marks it sold or removes it from NNAuto.

== Field mapping sources ==

* `title` — the post title
* `content` — the post content
* `meta:KEY` — a custom field value
* `tax:TAXONOMY` — taxonomy term names
* any other text — used as a fixed value

Required fields: brand, model, year, price. Missing optional fields fall back to
sensible defaults (and the default region/phone you configure).

== Changelog ==

= 1.0.0 =
* Initial release: settings, field mapping, auto-sync, bulk sync, trash handling.
