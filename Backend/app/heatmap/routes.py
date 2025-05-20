# import io
# import math
# import requests
# import numpy as np
# from flask import Blueprint, request, send_file, abort
# from shapely.geometry import Polygon

# # Force non‑GUI backend
# import matplotlib
# matplotlib.use('Agg')
# import matplotlib.pyplot as plt
# from matplotlib.collections import PatchCollection
# from matplotlib.patches import Polygon as MplPolygon

# heatmap_bp = Blueprint('heatmap', __name__)

# @heatmap_bp.route('/generate-epa-heatmap', methods=['POST'])
# def generate_epa_heatmap():
#     payload = request.get_json() or {}
#     region = payload.get("region")
#     if not region:
#         return {"error": "Region data is required"}, 400

#     # Unpack your region
#     lat, lng = region['latitude'], region['longitude']
#     lat_delta, lng_delta = region['latitudeDelta'], region['longitudeDelta']

#     # Convert lon/lat → Web Mercator
#     def lon_lat_to_web_mercator(lon, lat):
#         k = 6378137.0
#         x = lon * (k * math.pi / 180.0)
#         y = math.log(math.tan((90 + lat) * math.pi / 360.0)) * k
#         return x, y

#     # Build envelope
#     min_lat = lat - lat_delta/2
#     max_lat = lat + lat_delta/2
#     min_lng = lng - lng_delta/2
#     max_lng = lng + lng_delta/2

#     xmin, ymin = lon_lat_to_web_mercator(min_lng, min_lat)
#     xmax, ymax = lon_lat_to_web_mercator(max_lng, max_lat)

#     # Fetch features
#     url = (
#       "https://services2.arcgis.com/PYn6bWCjT6bhw1z3/arcgis/rest/services/"
#       "Escaped_Trash_Risk_Model_WFL1/FeatureServer/19/query"
#       f"?f=json"
#       f"&geometry={xmin},{ymin},{xmax},{ymax}"
#       "&geometryType=esriGeometryEnvelope"
#       "&spatialRel=esriSpatialRelIntersects"
#       "&outFields=OBJECTID,USCBmodel_dens"
#     )
#     resp = requests.get(url)
#     if not resp.ok:
#         abort(502, "Failed to fetch feature data")
#     features = resp.json().get("features", [])

#     patches = []
#     densities = []
#     all_x, all_y = [], []

#     # Reconstruct each square
#     for feat in features:
#         dens = feat['attributes'].get('USCBmodel_dens')
#         rings = feat.get('geometry', {}).get('rings')
#         if dens is None or not rings:
#             continue

#         ring = rings[0]
#         x0, y0 = ring[0]
#         pts = [(x0, y0)]
#         x, y = x0, y0
#         for dx, dy in ring[1:]:
#             x += dx
#             y += dy
#             pts.append((x, y))

#         # collect coords for extent
#         xs, ys = zip(*pts)
#         all_x.extend(xs)
#         all_y.extend(ys)

#         patches.append(MplPolygon(pts, closed=True))
#         densities.append(dens)

#     if not patches:
#         abort(404, "No valid features to plot")

#     # Build figure
#     fig, ax = plt.subplots(figsize=(6,6), dpi=150)
#     cmap = plt.get_cmap("Greens")
#     norm = plt.Normalize(vmin=min(densities), vmax=max(densities))
#     coll = PatchCollection(patches, cmap=cmap, norm=norm, edgecolor="none")
#     coll.set_array(np.array(densities))
#     ax.add_collection(coll)

#     # Tight bounds around your data
#     ax.set_xlim(min(all_x), max(all_x))
#     ax.set_ylim(min(all_y), max(all_y))

#     # No axes, ticks, margins
#     ax.axis('off')
#     plt.subplots_adjust(left=0, right=1, top=1, bottom=0)

#     # Render transparent PNG
#     buf = io.BytesIO()
#     fig.savefig(
#         buf,
#         format='png',
#         transparent=True,
#         bbox_inches='tight',
#         pad_inches=0
#     )
#     fig.savefig(
#         "/tmp/epa_heatmap.png",
#         format="png",
#         transparent=True,
#         bbox_inches="tight",
#         pad_inches=0
#     )
#     plt.close(fig)
#     buf.seek(0)

#     return send_file(buf, mimetype='image/png')
