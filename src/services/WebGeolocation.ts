export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface GeoAddress {
  full: string;
  display: string;
}

export const getBrowserLocation = (): Promise<GeoLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<GeoAddress | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'DayLog/1.0',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const address = data.address || {};

    const parts: string[] = [];
    if (address.city) parts.push(address.city);
    else if (address.town) parts.push(address.town);
    else if (address.village) parts.push(address.village);
    else if (address.suburb) parts.push(address.suburb);

    if (address.state) parts.push(address.state);
    else if (address.county) parts.push(address.county);

    if (address.country_code) {
      const countryCode = address.country_code.toUpperCase();
      parts.push(countryCode);
    }

    const display = parts.filter(Boolean).join(', ');

    const fullParts: string[] = [];
    if (data.display_name) {
      const nameParts = data.display_name.split(', ');
      fullParts.push(...nameParts.slice(0, 4));
    } else if (display) {
      fullParts.push(display);
    }

    return {
      full: fullParts.filter(Boolean).join(', '),
      display: display || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    };
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return null;
  }
};

export const fetchLocationOnWeb = async (): Promise<{ location: GeoLocation; address: GeoAddress } | null> => {
  try {
    const geo = await getBrowserLocation();
    const address = await reverseGeocode(geo.latitude, geo.longitude);
    
    if (!address) {
      return null;
    }

    return {
      location: geo,
      address,
    };
  } catch (error) {
    console.error('Web location fetch error:', error);
    return null;
  }
};
