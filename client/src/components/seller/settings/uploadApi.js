import axios from "axios";

const api = axios.create({
  baseURL:"http://localhost:8080",
  withCredentials: true,
});

export async function uploadMediaFile(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/marketplace/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  // { success:true, asset:{ kind, url, alt:"" } }
  return data.asset;
}
    