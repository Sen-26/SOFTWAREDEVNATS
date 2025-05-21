from flask import Blueprint, request, jsonify, abort
import math
import requests

heatmap_bp = Blueprint('heatmap', __name__)

@heatmap_bp.route('/generate-epa-heatmap', methods=['POST'])
def generate_epa_heatmap():
    payload = request.get_json() or {}
    region = payload.get("region")
    if not region:
        return {"error": "Region data is required"}, 400

    lat, lng = region['latitude'], region['longitude']
    lat_delta, lng_delta = region['latitudeDelta'], region['longitudeDelta']

    def lon_lat_to_web_mercator(lon, lat):
        k = 6378137.0
        x = lon * (k * math.pi / 180.0)
        y = math.log(math.tan((90 + lat) * math.pi / 360.0)) * k
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
        f"?f=json"
        f"&geometry={xmin},{ymin},{xmax},{ymax}"
        "&geometryType=esriGeometryEnvelope"
        "&spatialRel=esriSpatialRelIntersects"
        "&outFields=OBJECTID,USCBmodel_dens"
    )
    resp = requests.get(url)
    if not resp.ok:
        abort(502, "Failed to fetch feature data")

    features = resp.json().get("features", [])
    geojson_features = []

    for feat in features:
        dens = feat['attributes'].get('USCBmodel_dens')
        rings = feat.get('geometry', {}).get('rings')
        if dens is None or not rings:
            continue

        ring = rings[0]
        x0, y0 = ring[0]
        pts = [(x0, y0)]
        x, y = x0, y0
        for dx, dy in ring[1:]:
            x += dx
            y += dy
            pts.append((x, y))

        coords = [[ [lon, lat] for lon, lat in pts ]]

        geojson_features.append({
            "type": "Feature",
            "properties": {
                "density": dens
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": coords
            }
        })

    geojson = {
        "type": "FeatureCollection",
        "features": geojson_features
    }

    return jsonify(geojson)
