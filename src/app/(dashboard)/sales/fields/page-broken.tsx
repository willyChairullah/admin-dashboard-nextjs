"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import {
  Camera,
  CheckCircle,
  Navigation,
  Users,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { getCurrentPosition } from "@/lib/utils";
import { createFieldVisit } from "@/lib/actions/field-visits";
import { getStores } from "@/lib/actions/stores";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Loading from "@/components/ui/common/Loading";

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function SalesFieldPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [, startTransition] = useTransition();
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [useExistingStore, setUseExistingStore] = useState(true);
  const [visitPurpose, setVisitPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [storeSearchQuery, setStoreSearchQuery] = useState("");
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load data on component mount
  useEffect(() => {
    loadStores();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowStoreDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadStores = async () => {
    try {
      const result = await getStores();
      if (result.success) {
        setStores(result.data);
        setFilteredStores(result.data);
      }
    } catch (error) {
      console.error("Error loading stores:", error);
    }
  };

  const handleGetLocation = async () => {
    try {
      setIsCheckingIn(true);
      const position = await getCurrentPosition();
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      alert(
        "Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin lokasi diberikan."
      );
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhotos(true);

    try {
      const formData = new FormData();

      // Add all selected files to FormData
      Array.from(files).forEach((file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert(`File ${file.name} bukan gambar yang valid`);
          return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          alert(`File ${file.name} terlalu besar. Maksimal 5MB`);
          return;
        }

        formData.append("files", file);
      });

      console.log("Uploading files to server...");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Upload result:", result);

      if (result.success) {
        // Add uploaded file paths to photos state
        setPhotos((prevPhotos) => [...prevPhotos, ...result.files]);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        alert(`${result.files.length} foto berhasil diupload!`);
        console.log(`${result.files.length} foto berhasil diupload ke server`);
      } else {
        console.error("Upload failed:", result.error);
        alert(`Gagal mengupload foto: ${result.error}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        `Gagal mengupload foto: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const handleStoreSearch = (query: string) => {
    setStoreSearchQuery(query);
    if (query.trim() === "") {
      setFilteredStores(stores);
      setShowStoreDropdown(false);
    } else {
      const filtered = stores.filter(
        (store) =>
          store.name.toLowerCase().includes(query.toLowerCase()) ||
          store.address.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredStores(filtered);
      setShowStoreDropdown(true);

      // Clear selected store if it's not in the filtered results
      if (
        selectedStore &&
        !filtered.find((store) => store.id === selectedStore)
      ) {
        setSelectedStore("");
      }
    }
  };

  const handleStoreSelect = (storeId: string, storeName: string) => {
    setSelectedStore(storeId);
    setStoreSearchQuery(storeName);
    setShowStoreDropdown(false);
  };

  const deleteUploadedFile = async (filePath: string) => {
    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pathname: filePath }),
      });

      const result = await response.json();
      if (result.success) {
        console.log("File deleted successfully from server");
      } else {
        console.error("Failed to delete file:", result.error);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const clearAllPhotos = async () => {
    // Delete all uploaded files from server
    for (const photoPath of photos) {
      await deleteUploadedFile(photoPath);
    }

    // Clear photos from state
    setPhotos([]);
  };

  const clearPhotosFromState = () => {
    // Only clear photos from state without deleting from server
    // Used when form is successfully submitted and photos are saved to database
    setPhotos([]);
  };

  const handleCheckIn = async () => {
    if (!currentLocation) {
      alert("Lokasi belum didapatkan. Klik tombol GPS terlebih dahulu.");
      return;
    }

    if (!selectedStore && useExistingStore) {
      alert("Pilih toko yang dikunjungi terlebih dahulu.");
      return;
    }

    if (!storeName && !useExistingStore) {
      alert("Masukkan nama toko yang dikunjungi.");
      return;
    }

    if (!visitPurpose) {
      alert("Pilih tujuan kunjungan terlebih dahulu.");
      return;
    }

    if (!user) {
      alert("User not authenticated");
      return;
    }

    try {
      setIsSaving(true);

      startTransition(async () => {
        try {
          const result = await createFieldVisit({
            salesId: user.id,
            storeId: useExistingStore ? selectedStore : undefined,
            storeName: useExistingStore ? undefined : storeName,
            storeAddress: useExistingStore ? undefined : storeAddress,
            visitPurpose,
            notes,
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
            photos,
          });

          if (result.success) {
            alert(
              result.message ||
                "Check-in berhasil! Data kunjungan telah disimpan ke database."
            );

            // Reset form
            setCurrentLocation(null);
            setPhotos([]); // Only clear photos from state, don't delete from server since they're saved
            setSelectedStore("");
            setStoreName("");
            setStoreAddress("");
            setVisitPurpose("");
            setNotes("");
            setStoreSearchQuery("");
            setShowStoreDropdown(false);
            setFilteredStores(stores);
          } else {
            alert("Gagal menyimpan data: " + (result.error || "Unknown error"));
          }
        } catch (error) {
          console.error("Error saving check-in:", error);
          alert("Gagal menyimpan data. Coba lagi nanti.");
        } finally {
          setIsSaving(false);
        }
      });
    } catch (error) {
      console.error("Error in handleCheckIn:", error);
      setIsSaving(false);
    }
  };

  const openInMaps = () => {
    if (!currentLocation) {
      alert("Lokasi belum didapatkan. Ambil lokasi GPS terlebih dahulu.");
      return;
    }

    const { lat, lng } = currentLocation;
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(googleMapsUrl, "_blank");
  };

  const getSelectedStore = () => {
    return stores.find((store) => store.id === selectedStore);
  };

  if (userLoading || !user) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                Check-in Kunjungan
              </h1>
              <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-300">
                Form check-in untuk sales lapangan - <span className="font-semibold text-blue-600 dark:text-blue-400">{user.name || user.email}</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-left lg:text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Sales Representative
                </p>
                <p className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate max-w-[200px]">
                  {user.email}
                </p>
              </div>
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
            </div>
          </div>
        </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Username
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {user.name}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>
      </div>

        {/* Check-in Form */}
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
            {/* Form Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                  <MapPin className="h-6 w-6 mr-3 text-white/90" />
                  Check-in Kunjungan Baru
                </h3>
                <p className="mt-2 text-blue-100 text-sm sm:text-base">
                  Catat bukti kunjungan lapangan dengan lokasi GPS dan foto
                </p>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
            </div>

            <div className="p-8 space-y-8">
            {/* Store Selection */}
            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 dark:border-blue-800/30">
              <label className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <Users className="w-5 h-5 mr-3 text-blue-500" />
                Pilih Toko *
              </label>

              {/* Toggle between existing and new store */}
              <div className="mb-6">
                <div className="flex space-x-6">
                  <label className="flex items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-blue-100/50 dark:border-blue-800/30 hover:bg-blue-50/70 dark:hover:bg-blue-900/30 transition-all cursor-pointer">
                    <input
                      type="radio"
                      name="storeType"
                      checked={useExistingStore}
                      onChange={() => setUseExistingStore(true)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Pilih dari daftar toko
                    </span>
                  </label>
                  <label className="flex items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-blue-100/50 dark:border-blue-800/30 hover:bg-blue-50/70 dark:hover:bg-blue-900/30 transition-all cursor-pointer">
                    <input
                      type="radio"
                      name="storeType"
                      checked={!useExistingStore}
                      onChange={() => setUseExistingStore(false)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Toko baru
                    </span>
                  </label>
                </div>
              </div>

              {useExistingStore ? (
                <>
                  {/* Searchable dropdown for existing stores */}
                  <div className="relative" ref={dropdownRef}>
                    <input
                      type="text"
                      value={storeSearchQuery}
                      onChange={(e) => handleStoreSearch(e.target.value)}
                      onFocus={() => {
                        if (storeSearchQuery.trim() !== "") {
                          setShowStoreDropdown(true);
                        }
                      }}
                      placeholder="Cari dan pilih toko berdasarkan nama atau alamat..."
                      className="block w-full px-4 py-4 text-base border-2 border-blue-200/50 dark:border-blue-700/50 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl backdrop-blur-sm transition-all shadow-lg"
                    />

                    {/* Custom Dropdown */}
                    {showStoreDropdown && filteredStores.length > 0 && (
                      <div className="absolute z-20 w-full mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-blue-200/50 dark:border-blue-700/50 rounded-xl shadow-2xl max-h-64 overflow-auto">
                        {filteredStores.map((store) => (
                          <button
                            key={store.id}
                            type="button"
                            onClick={() =>
                              handleStoreSelect(store.id, store.name)
                            }
                            className="w-full px-4 py-3 text-left hover:bg-blue-50/70 dark:hover:bg-blue-900/30 border-b border-blue-100/50 dark:border-blue-800/30 last:border-b-0 focus:outline-none focus:bg-blue-100/70 dark:focus:bg-blue-900/40 transition-all"
                          >
                            <div className="font-semibold text-gray-900 dark:text-white">{store.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                              {store.address}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Show "no results" message */}
                    {showStoreDropdown &&
                      filteredStores.length === 0 &&
                      storeSearchQuery && (
                        <div className="absolute z-20 w-full mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-red-200/50 dark:border-red-700/50 rounded-xl shadow-2xl p-4">
                          <div className="text-base text-red-600 dark:text-red-400 text-center font-medium">
                            Tidak ditemukan toko dengan kata kunci "
                            {storeSearchQuery}"
                          </div>
                        </div>
                      )}

                    {/* Search results info */}
                    {storeSearchQuery && !showStoreDropdown && (
                      <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {filteredStores.length > 0
                          ? `Ditemukan ${filteredStores.length} dari ${stores.length} toko`
                          : `Tidak ditemukan toko dengan kata kunci "${storeSearchQuery}"`}
                      </div>
                    )}
                  </div>

                  {/* Store location info */}
                  {selectedStore &&
                    getSelectedStore()?.latitude &&
                    getSelectedStore()?.longitude && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p className="font-medium">
                              {getSelectedStore()?.name}
                            </p>
                            <p>
                              Lat: {getSelectedStore()?.latitude?.toFixed(6)},
                              Lng: {getSelectedStore()?.longitude?.toFixed(6)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const store = getSelectedStore();
                              if (store?.latitude && store?.longitude) {
                                const url = `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;
                                window.open(url, "_blank");
                              }
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                          >
                            <MapPin className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Nama Toko *
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Masukkan nama toko"
                      className="block w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Alamat Toko *
                    </label>
                    <input
                      type="text"
                      value={storeAddress}
                      required
                      onChange={(e) => setStoreAddress(e.target.value)}
                      placeholder="Masukkan alamat toko (wajib)"
                      className="block w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    />
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-md">
                    💡 Toko baru akan disimpan ke database dengan lokasi GPS
                    saat ini
                  </div>
                </div>
              )}
            </div>

            {/* Visit Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tujuan Kunjungan *
              </label>
              <select
                value={visitPurpose}
                onChange={(e) => setVisitPurpose(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              >
                <option value="">Pilih tujuan kunjungan</option>
                <option value="sales">Sales Visit</option>
                <option value="followup">Follow-up Visit</option>
                <option value="newcustomer">New Customer Visit</option>
                <option value="collection">Collection Visit</option>
                <option value="survey">Survey Visit</option>
                <option value="delivery">Delivery Visit</option>
                <option value="maintenance">Maintenance Visit</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lokasi GPS *
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isCheckingIn}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {isCheckingIn ? "Mendapatkan Lokasi..." : "Ambil Lokasi GPS"}
                </button>
                {currentLocation && (
                  <>
                    <span className="text-sm text-green-600 font-medium">
                      📍 Lokasi berhasil didapat
                    </span>
                    <button
                      type="button"
                      onClick={openInMaps}
                      className="inline-flex items-center px-3 py-1 border border-blue-300 dark:border-blue-600 shadow-sm text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Buka di Maps
                    </button>
                  </>
                )}
              </div>
              {currentLocation && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  <p>Latitude: {currentLocation.lat.toFixed(6)}</p>
                  <p>Longitude: {currentLocation.lng.toFixed(6)}</p>
                </div>
              )}
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Foto Kunjungan
              </label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhotos}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isUploadingPhotos ? "Mengupload..." : "Tambah Foto"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />

                {photos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {photos.length} foto telah diupload
                      </p>
                      <button
                        type="button"
                        onClick={clearAllPhotos}
                        disabled={isUploadingPhotos}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-2 py-1 border border-red-300 dark:border-red-600 rounded disabled:opacity-50"
                      >
                        Hapus Semua
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo}
                            alt={`Foto ${index + 1}`}
                            className="h-24 w-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              // Delete file from server
                              await deleteUploadedFile(photo);
                              // Remove from state
                              setPhotos((prevPhotos) =>
                                prevPhotos.filter((_, i) => i !== index)
                              );
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      📁 Foto disimpan di folder uploads server
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catatan Kunjungan
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tuliskan catatan mengenai kunjungan ini..."
              />
            </div>

            {/* Check-in Button */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={
                  !currentLocation ||
                  (useExistingStore ? !selectedStore : !storeName) ||
                  !visitPurpose ||
                  isSaving
                }
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                {isSaving ? "Menyimpan..." : "Check-in Kunjungan"}
              </button>
              {(!currentLocation ||
                (useExistingStore ? !selectedStore : !storeName) ||
                !visitPurpose) &&
                !isSaving && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                    * Lengkapi semua field yang wajib diisi
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
