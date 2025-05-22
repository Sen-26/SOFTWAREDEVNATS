import React, { useEffect, useState } from 'react';
import MapView, { PROVIDER_GOOGLE, Polygon, LatLng } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import axios from 'axios';

const parseGeoJSONToPolygons = (geojsonData: any): {
  id: string;
  coordinates: LatLng[];
  density: number;
}[] => {
  return geojsonData.features.map((feature: any, index: number) => {
    const coords: LatLng[] = feature.geometry.coordinates[0].map(([lng, lat]: [number, number]) => ({
      latitude: lat,
      longitude: lng,
    }));
    return {
      id: `polygon-${index}`,
      coordinates: coords,
      density: feature.properties.density ?? 0,
    };
  });
};

const getFillColor = (density: number, opacity: number): string => {
  const red = Math.floor(255 * density);
  const green = Math.floor(255 * (1 - density));
  return `rgba(${red}, ${green}, 0, ${opacity})`;
};

export default function LitterHeatmapMapView({
  region,
  mapStyle,
  epaMapVisible,
  epaMapOpacity,
}: {
  region: any;
  mapStyle: any;
  epaMapVisible: boolean;
  epaMapOpacity: number;
}) {
  const [polygons, setPolygons] = useState<
    { id: string; coordinates: LatLng[]; density: number }[]
  >([]);

  useEffect(() => {
    const fetchGeojson = async () => {
      try {
        const res = await axios.post('http://192.168.193.45:5431/heatmap/generate-epa-heatmap', {
          region: region,
        });
        console.log(JSON.stringify(res.data));
        const parsed = parseGeoJSONToPolygons(res.data);
        setPolygons(parsed);
        //console.log(parsed);
      } catch (err) {
        console.error("Failed to load EPA heatmap", err);
      }
    };
  
   
    fetchGeojson();
    
  }, [region, epaMapVisible]);
  
  return (
    <MapView
      style={StyleSheet.absoluteFillObject}
      provider={PROVIDER_GOOGLE}
      showsUserLocation
      followsUserLocation
      region={region}
      customMapStyle={mapStyle}
    >
      {
        
        polygons.map((poly) => (
          <Polygon
            key={poly.id}
            coordinates={poly.coordinates}
            fillColor="rgba(255, 0, 0, 0.5)"
            strokeColor="rgba(0,0,0,0.05)"
            strokeWidth={0.5}
          />
        ))}
    </MapView>
  );
}
