import os
import requests
import io
import matplotlib.pyplot as plt
import numpy as np
from flask import Blueprint, request, send_file
from PIL import Image
from mapbox_vector_tile import decode

heatmap_bp = Blueprint('heatmap', __name__)

@heatmap_bp.route('/generate-epa-heatmap', methods=['POST'])
def generate_epa_heatmap():
    data = request.get_json()
    region = data.get("region")
    if not region:
        return {"error": "Region data is required"}, 400

    lat = region['latitude']
    lng = region['longitude']
    lat_delta = region['latitudeDelta']
    lng_delta = region['longitudeDelta']

    # Convert to Web Mercator (EPSG:3857) for ArcGIS query
    def lon_lat_to_web_mercator(lon, lat):
        k = 6378137
        x = lon * (k * np.pi/180.0)
        y = np.log(np.tan((90 + lat) * np.pi/360.0)) * k
        return x, y

    min_lat = lat - lat_delta / 2
    max_lat = lat + lat_delta / 2
    min_lng = lng - lng_delta / 2
    max_lng = lng + lng_delta / 2
    xmin, ymin = lon_lat_to_web_mercator(min_lng, min_lat)
    xmax, ymax = lon_lat_to_web_mercator(max_lng, max_lat)

    url = (
        "https://services2.arcgis.com/PYn6bWCjT6bhw1z3/arcgis/rest/services/"
        "Escaped_Trash_Risk_Model_WFL1/FeatureServer/19/query"
        f"?f=pbf&geometry={xmin},{ymin},{xmax},{ymax}&geometryType=esriGeometryEnvelope"
        f"&spatialRel=esriSpatialRelIntersects&outFields=OBJECTID,USCBmodel_dens"
        f"&resultType=tile&quantizationParameters=%7B%22extent%22:%7B%22xmin%22:{xmin},%22ymin%22:{ymin},%22xmax%22:{xmax},%22ymax%22:{ymax}%7D,%22mode%22:%22view%22,%22tolerance%22:1%7D"
    )

    resp = requests.get(url)
    if not resp.ok:
        return {"error": "Failed to fetch PBF"}, 500

    tile_data = decode(resp.content)
    features = tile_data.get("features", []) or list(tile_data.values())[0]

    width, height = 512, 512
    grid = np.zeros((height, width))

    for f in features:
        props = f.get("properties", {})
        geom = f.get("geometry", {})
        if props.get("USCBmodel_dens") and geom.get("type") == "Point":
            x, y = geom["coordinates"]
            px = int(x / 4096 * width)
            py = int(y / 4096 * height)
            grid[py % height, px % width] += props["USCBmodel_dens"]

    plt.figure(figsize=(5, 5))
    plt.imshow(grid, cmap='hot', interpolation='nearest')
    plt.axis('off')
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    buf.seek(0)
    plt.close()

    return send_file(buf, mimetype='image/png')
