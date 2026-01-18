
export interface OSMPlace {
  id: number;
  type: string;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    "addr:street"?: string;
    "addr:city"?: string;
    phone?: string;
    website?: string;
    opening_hours?: string;
    healthcare?: string;
    emergency?: string;
    [key: string]: string | undefined;
  };
}

export const searchNearbyPlaces = async (
  lat: number,
  lon: number,
  type: 'emergency' | 'physio' | 'hospital'
): Promise<OSMPlace[]> => {
  const radius = 10000; // 10km radius
  let query = '';

  if (type === 'physio') {
    const keywords = ['physiotherapist', 'physiotherapy', 'rehabilitation', 'physical_therapy'];
    // Search for physiotherapy centers
    query = `
      [out:json][timeout:60];
      (
        node["healthcare"~"${keywords.join('|')}"](around:${radius},${lat},${lon});
        node["medical_specialty"~"${keywords.join('|')}"](around:${radius},${lat},${lon});
        way["healthcare"~"${keywords.join('|')}"](around:${radius},${lat},${lon});
        node["name"~"Physio|Rehab",i](around:${radius},${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;
  } else if (type === 'hospital') {
    // General hospital search
    query = `
      [out:json][timeout:60];
      (
        node["healthcare"="hospital"](around:${radius},${lat},${lon});
        way["healthcare"="hospital"](around:${radius},${lat},${lon});
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        way["amenity"="hospital"](around:${radius},${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;
  } else {
    // Search for hospitals with emergency rooms explicitly
    query = `
      [out:json][timeout:60];
      (
        node["healthcare"="hospital"]["emergency"="yes"](around:${radius},${lat},${lon});
        way["healthcare"="hospital"]["emergency"="yes"](around:${radius},${lat},${lon});
        node["amenity"="hospital"]["emergency"="yes"](around:${radius},${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;
  }

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.statusText}`);
    }
    const data = await response.json();
    const uniqueIds = new Set();
    // Filter for just nodes/ways that have tags (the interesting elements)
    return data.elements.filter((el: any) => {
      if (!el.tags || (!el.tags.name && !el.tags.healthcare && !el.tags.amenity)) return false;
      if (uniqueIds.has(el.id)) return false;
      uniqueIds.add(el.id);
      return true;
    });
  } catch (error) {
    console.error('OSM Search Error:', error);
    throw error;
  }
};

export const searchPlacesByKeyword = async (keyword: string): Promise<OSMPlace[]> => {
  // using Nominatim for keyword search
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(keyword)}&format=json&addressdetails=1&limit=10&extratags=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HemoCare-Ai/1.0'
      }
    });
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }
    const data = await response.json();

    return data.map((item: any) => ({
      id: item.osm_id,
      type: item.osm_type,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      tags: {
        name: item.name || item.display_name.split(',')[0],
        "addr:street": item.address?.road,
        "addr:city": item.address?.city || item.address?.town || item.address?.village,
        healthcare: item.type,
        amenity: item.class,
        ...item.extratags
      }
    }));
  } catch (error) {
    console.error('Nominatim Search Error:', error);
    throw error;
  }
};
