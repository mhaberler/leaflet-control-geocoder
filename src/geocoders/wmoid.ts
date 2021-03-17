import * as L from 'leaflet';
import { IGeocoder, GeocodingCallback, GeocodingResult } from './api';

export interface WmoIdOptions {
    /**
     * The next geocoder to use for non-supported queries
     */
    next?: IGeocoder;
    /**
     * The size in meters used for passing to `LatLng.toBounds`
     */
    sizeInMeters: number;
    /**
     * The summary GeoJSON object
     */
    summary: Object;
}

/**
 * search in WMO station_id and name by case-insensitive substring search
 */
export class WmoId implements IGeocoder {
    options: WmoIdOptions = {
	next: undefined,
	summary: {},
	sizeInMeters: 10000
    };

    constructor(options?: Partial<WmoIdOptions>) {
	L.Util.setOptions(this, options);
    }

    geocode(query: string, cb: GeocodingCallback, context?: any) {
	//console.log("wmoid.geocode", query);

	let found = []
	let regex = new RegExp(query, "i");
	
	//@ts-ignore
	for (var i in  this.options.summary.features) {
	    //@ts-ignore
	    let p = this.options.summary.features[i].properties;
	    if ((p.station_id.search(regex) > -1) || (p.name.search(regex) > -1)) {
		//@ts-ignore
		found.push(this.options.summary.features[i]);
	    }
	}
	if (found) {
            const results: GeocodingResult[] = [];

	    for (var index = 0; index < found.length; index++) {
		var f = found[index];
		console.log(f, index);
		
		const center = L.latLng(f.geometry.coordinates[1],
					f.geometry.coordinates[0],
					f.geometry.coordinates[2]);
		results[index] = {
		    name: f.properties.name + " (wmo " + f.properties.station_id + ")",
		    bbox: center.toBounds(this.options.sizeInMeters),
		    center: center
		};
		// only the first 5 results
		if (index > 5)
		    break;
	    };
	    cb.call(context, results);
	} else if (this.options.next) {
	    this.options.next.geocode(query, cb, context);
	}
    }
}

/**
 * [Class factory method](https://leafletjs.com/reference.html#class-class-factories) for {@link WmoId}
 * @param options the options
 */
export function wmoId(options?: Partial<WmoIdOptions>) {
    return new WmoId(options);
}
