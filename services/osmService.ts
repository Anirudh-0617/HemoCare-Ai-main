
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
    type: 'emergency' | 'physio'
): Promise<OSMPlace[]> => {
    const radius = 5000; // 5km radius
    let query = '';

    if (type === 'physio') {
        // Search for physiotherapy centers
        query = `
      [out:json][timeout:25];
      (
        node["healthcare"="physiotherapist"](around:${radius},${lat},${lon});
        node["medical_specialty"="physiotherapy"](around:${radius},${lat},${lon});
        way["healthcare"="physiotherapist"](around:${radius},${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;
    } else {
        // Search for hospitals with emergency rooms
        query = `
      [out:json][timeout:25];
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
        // Filter for just nodes/ways that have tags (the interesting elements)
        return data.elements.filter((el: any) => el.tags && (el.tags.name || el.tags.healthcare || el.tags.amenity));
    } catch (error) {
        console.error('OSM Search Error:', error);
        throw error;
    }
};
