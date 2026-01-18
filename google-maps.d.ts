// Type definitions for Google Maps JavaScript API
declare namespace google {
    namespace maps {
        class Map {
            constructor(mapDiv: HTMLElement, opts?: any);
        }
        class LatLng {
            constructor(lat: number, lng: number);
        }
        namespace places {
            class PlacesService {
                constructor(attrContainer: HTMLElement | Map);
                nearbySearch(
                    request: PlaceSearchRequest,
                    callback: (results: PlaceResult[] | null, status: PlacesServiceStatus) => void
                ): void;
            }
            enum PlacesServiceStatus {
                OK = 'OK',
                ZERO_RESULTS = 'ZERO_RESULTS',
                ERROR = 'ERROR'
            }
            interface PlaceSearchRequest {
                location: LatLng;
                radius: number;
                type?: string;
                keyword?: string;
            }
            interface PlaceResult {
                name?: string;
                vicinity?: string;
                place_id?: string;
                rating?: number;
                types?: string[];
                geometry?: {
                    location?: {
                        lat(): number;
                        lng(): number;
                    };
                };
            }
        }
    }
}
