"use client";

import { useEffect, useState } from "react";
import { MapPin, Camera, Clock, User, Building } from "lucide-react";
import { getFieldVisits } from "@/lib/actions/field-visits";
import Loading from "@/components/ui/common/Loading";

interface FieldVisit {
  id: string;
  visitDate: Date;
  checkInTime: Date;
  latitude: number;
  longitude: number;
  visitPurpose: string;
  notes?: string;
  photos: string[];
  sales: {
    id: string;
    name: string;
    email: string;
  };
  store: {
    id: string;
    name: string;
    address: string;
  } | null;
  storeName?: string;
  storeAddress?: string;
}

export default function FieldVisitsPage() {
  const [fieldVisits, setFieldVisits] = useState<FieldVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFieldVisits();
  }, []);

  const loadFieldVisits = async () => {
    try {
      const result = await getFieldVisits();
      if (result.success) {
        setFieldVisits(result.data as any);
      }
    } catch (error) {
      console.error("Error loading field visits:", error);
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (lat: number, lng: number) => {
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(googleMapsUrl, "_blank");
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Field Visits
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          History of sales field visits with photos and GPS locations
        </p>
      </div>

      {/* Field Visits List */}
      <div className="space-y-6">
        {fieldVisits.length === 0 ? (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No field visits
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Start by creating a new field visit check-in.
            </p>
          </div>
        ) : (
          fieldVisits.map((visit) => (
            <div
              key={visit.id}
              className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700 rounded-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {visit.sales.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {visit.sales.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Visit Purpose
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {visit.visitPurpose.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Visit Details */}
                  <div className="space-y-4">
                    {/* Store Information */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Store Information
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {visit.store?.name ||
                            visit.storeName ||
                            "Unknown Store"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {visit.store?.address ||
                            visit.storeAddress ||
                            "No address"}
                        </p>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Visit Time
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(visit.visitDate).toLocaleDateString(
                            "id-ID",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          Check-in:{" "}
                          {new Date(visit.checkInTime).toLocaleTimeString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        GPS Location
                      </h4>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p>Lat: {visit.latitude.toFixed(6)}</p>
                            <p>Lng: {visit.longitude.toFixed(6)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              openInMaps(visit.latitude, visit.longitude)
                            }
                            className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
                          >
                            <MapPin className="h-4 w-4" />
                            <span>Open in Maps</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {visit.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Notes
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {visit.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Photos */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Photos ({visit.photos.length})
                    </h4>
                    {visit.photos.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {visit.photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo}
                              alt={`Visit photo ${index + 1}`}
                              className="h-32 w-full object-cover rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() => window.open(photo, "_blank")}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="h-6 w-6 text-white drop-shadow-lg" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <Camera className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          No photos taken during this visit
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
