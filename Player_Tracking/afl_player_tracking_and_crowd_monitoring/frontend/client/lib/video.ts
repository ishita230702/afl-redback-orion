import API from "@/api/axiosInstance";

export async function uploadVideo(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await API.post("/uploads/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1)
      );
      console.log("Upload progress:", percent);
    },
  });

  return res.data; // {id, user_id, path, media_type, ...}
}

export async function runPlayerInference(uploadId: string) {
  const res = await API.post("/inference/player/track", { id: uploadId });
  return res.data; // backend returns heatmaps, analytics JSON, etc.
}

export async function listUploads() {
  const res = await API.get("/uploads/");
  return res.data; // array of uploads
}

export async function deleteUpload(uploadId: string) {
  const res = await API.delete(`/uploads/${uploadId}`);
  return res.data; // { success: true }
}

export async function runCrowdInference(uploadId: string) {
  const res = await API.post(`/inference/crowd/${uploadId}`);
  return res.data; // backend returns heatmaps, analytics JSON, etc.
}

// ✅ Get combined player dashboard with safe fallback
export async function getPlayerDashboard(uploadId: string) {
  try {
    const res = await API.get(`/analysis/player-dashboard/${uploadId}`);
    return res.data;
  } catch (err: any) {
    console.error("❌ getPlayerDashboard failed:", err?.response?.status);
    return { status: "not_available" };
  }
}

// ✅ Get crowd analysis results with safe fallback
export async function getCrowdAnalysis(uploadId: string) {
  try {
    const res = await API.get(`/analysis/crowd/${uploadId}`);
    return res.data;
  } catch (err: any) {
    console.error("❌ getCrowdAnalysis failed:", err?.response?.status);
    return { status: "not_available" };
  }
}
