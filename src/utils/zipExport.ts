import JSZip from "jszip";
import { PROJECT_1_FILES, PROJECT_2_FILES } from "../data/projectFiles";
import { CodeFile } from "../types";

export async function downloadProjectZip(
  project: "backend" | "client" | "both",
  zipName: string
): Promise<void> {
  const zip = new JSZip();

  let filesToInclude: CodeFile[] = [];
  if (project === "backend") {
    filesToInclude = PROJECT_1_FILES;
  } else if (project === "client") {
    filesToInclude = PROJECT_2_FILES;
  } else {
    filesToInclude = [...PROJECT_1_FILES, ...PROJECT_2_FILES];
  }

  filesToInclude.forEach((file) => {
    // If downloading a single project, strip the leading folder name so the archive root is clean
    let filePathInZip = file.path;
    if (project === "backend") {
      filePathInZip = file.path.replace(/^api-backend\//, "");
    } else if (project === "client") {
      filePathInZip = file.path.replace(/^api-client\//, "");
    }

    zip.file(filePathInZip, file.content);
  });

  // Generate blob and trigger browser download
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${zipName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
