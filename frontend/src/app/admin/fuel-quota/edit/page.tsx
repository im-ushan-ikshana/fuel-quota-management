import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";

export default function EditFuelQuotaPage() {
  const router = useRouter();
  const { id } = router.query;

  const [stationName, setStationName] = useState("");
  const [quota, setQuota] = useState("");

  useEffect(() => {
    if (!id) return;

    // Fetch existing quota by id - replace with real API call
    fetch(`/api/fuel-quota/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setStationName(data.stationName);
        setQuota(String(data.quota));
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationName || !quota) {
      alert("Please fill in all fields");
      return;
    }

    await fetch(`/api/fuel-quota/${id}`, {
      method: "PUT",
      body: JSON.stringify({ stationName, quota: Number(quota) }),
      headers: { "Content-Type": "application/json" },
    });

    router.push("/admin/fuel-quota/page");
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Edit Fuel Quota</h2>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Station Name</label>
          <input
            type="text"
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Quota</label>
          <input
            type="number"
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-purple-800 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Update
        </button>
      </form>
    </Layout>
  );
}
