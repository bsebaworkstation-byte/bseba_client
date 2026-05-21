import api from "./axios_resonse_interceptor";

export const removeImage = async (oldFileUrl) => {
  if (!oldFileUrl || oldFileUrl.includes("noImage.png")) return;

  const oldFile = oldFileUrl.split("/").pop();

  try {
    const res = await fetch(`https://image.bseba.top/delete/${oldFile}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      // HTTP error
      console.warn(`Failed to remove image: ${res.status} ${res.statusText}`);
      return false;
    }

    const data = await res.json(); // যদি server JSON return করে
    // Server returns: { "message": "File deleted successfully." }
    if (data.message === "File deleted successfully.") {
      return true;
    }

    console.warn("Failed to remove image:", data);
    return false;
  } catch (err) {
    console.warn("Old image remove failed:", err.message);
    return false;
  }
};

export const uploadImage = async (
  file,
  oldFileUrl = null,
  mobileNumber,
  maxSizeMB = 2
) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/bmp"];
  const maxSize = maxSizeMB * 1024 * 1024;

  try {
    if (!file) throw new Error("No file selected");
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Please upload PNG, JPG, JPEG, or BMP only");
    }
    if (file.size > maxSize) {
      throw new Error(`Image must be smaller than ${maxSizeMB}MB`);
    }

    // ✅ Remove old image if exists
    if (oldFileUrl) {
      await removeImage(oldFileUrl);
    }

    // ✅ Create renamed file (blob copy)
    const extension = file.name.split(".").pop();
    const renamedFile = new File([file], `${mobileNumber}.${extension}`, {
      type: file.type,
    });

    const fd = new FormData();
    fd.append("file", renamedFile);

    // ✅ Upload with renamed filename
    const res = await fetch(`https://image.bseba.top/upload`, {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    if (res.ok && data?.imageUrl) return data.imageUrl;

    throw new Error("Upload failed");
  } catch (err) {
    throw new Error(err.message || "Upload failed");
  }
};

// 🔥 Upload + optional old image remove
export const uploadImageNormal = async (
  file,
  oldFileUrl = null,
  maxSizeMB = 2
) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/bmp"];
  const maxSize = maxSizeMB * 1024 * 1024;

  try {
    if (!file) throw new Error("No file selected");
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Please upload PNG, JPG, JPEG, or BMP only");
    }
    if (file.size > maxSize) {
      throw new Error(`Image must be smaller than ${maxSizeMB}MB`);
    }

    // ✅ পুরনো ফাইল থাকলে remove করো
    if (oldFileUrl) {
      await removeImage(oldFileUrl);
    }

    // ✅ নতুন ফাইল upload করো
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("https://image.bseba.top/upload", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    if (res.ok && data?.imageUrl) return data.imageUrl;

    throw new Error("Upload failed");
  } catch (err) {
    throw new Error(err.message || "Upload failed");
  }
};

export const uploadProductImage = async (
  file,
  oldFileUrl = null,
  maxSizeMB = 2
) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/bmp"];
  const maxSize = maxSizeMB * 1024 * 1024;

  try {
    if (!file) throw new Error("No file selected");
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Please upload PNG, JPG, JPEG, or BMP only");
    }
    if (file.size > maxSize) {
      throw new Error(`Image must be smaller than ${maxSizeMB}MB`);
    }

    // পুরনো ফাইল থাকলে remove করো
    if (oldFileUrl) {
      await removeImage(oldFileUrl);
    }

    const fd = new FormData();

    const counterRes = await api.get(`/getImageCount`);

    if (counterRes.data.status !== "Success") {
      throw new Error("Image Counter Failed");
    }

    const counter = counterRes.data.count;

    // -------------------------------
    // 🔥 File Name + Counter Add
    // -------------------------------
    const originalName = file.name; // e.g. "abc.png"
    const dotIndex = originalName.lastIndexOf(".");

    const nameWithoutExt = originalName.substring(0, dotIndex); // abc
    const ext = originalName.substring(dotIndex); // .png

    const newFileName = `${nameWithoutExt}-${counter}${ext}`; // abc-8.png

    // নতুন File object তৈরি
    const newFile = new File([file], newFileName, { type: file.type });

    // append নতুন filename সহ file
    fd.append("file", newFile);

    // Upload...
    const res = await fetch("https://image.bseba.top/upload", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    if (res.ok && data?.imageUrl) return data.imageUrl;

    throw new Error("Upload failed");
  } catch (err) {
    throw new Error(err.message || "Upload failed");
  }
};
