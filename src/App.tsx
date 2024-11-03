import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open, message, ask } from "@tauri-apps/plugin-dialog";
import { open as shellOpen } from "@tauri-apps/plugin-shell";
import "./App.css";
import BMCLogo from "./assets/bmc-logo.svg";
import { version } from "../package.json";

function App() {
  const [sourceFolder, setSourceFolder] = useState("");
  const [sourceFolderSelected, setSourceFolderSelected] = useState(false);
  const [destinationFolder, setDestinationFolder] = useState("");
  const [destinationFolderSelected, setDestinationFolderSelected] =
    useState(false);
  const [removeOriginal, setRemoveOriginal] = useState(false);
  const [convertToJPEG, setConvertToJPEG] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    invoke("detect_profile_dir").catch(async (_error) => {
      console.log("Cannot detect profile directory");
    }).then((result) => {
      if (!result) {
        return;
      }
      setSourceFolder(result as string);
      setSourceFolderSelected(true);
    });
  });

  function canStart() {
    return (
      !processing && sourceFolder.length > 0 && destinationFolder.length > 0
    );
  }

  /**
   * Check source folder has files to convert and is not the same as the destination folder.
   * @param result The source folder path.
   * @returns
   */
  async function handleSourceFolderSelection(result: string | null) {
    if (result === null) {
      return;
    }

    let empty = false;
    await invoke("check_dir_not_empty", { path: result }).catch(
      async (error) => {
        await message(error as string, {
          title: "RDR2PBC",
          kind: "error",
        });
        empty = true;
      }
    );
    if (empty) {
      return;
    }

    let isValid = await validateFolders(result, destinationFolder);
    if (isValid) {
      setSourceFolder(result);
      setSourceFolderSelected(true);
    }
  }

  /**
   * Start the backup and conversion process.
   */
  async function start() {
    setProcessing(true);
    setHasProcessed(true);
    invoke("backup_and_convert", {
      sourcePath: sourceFolder,
      destinationPath: destinationFolder,
      removeOriginal: removeOriginal,
      convert: convertToJPEG,
    })
      .then(async (resultMessage) => {
        // await message(resultMessage as string, {
        //   title: "RDR2PBC",
        //   kind: "info",
        // });
        let message = `${resultMessage as string}\n\nDo you want to open the destination folder?`;
        let openFolder = await ask(message, {
          title: "RDR2PBC",
          kind: "info",
        });
        if (openFolder) {
          shellOpen(destinationFolder);
        }
      })
      .catch(async (err) => {
        await message(`Backup and conversion failed.\n${err as string}`, {
          title: "RDR2PBC",
          kind: "error",
        });
      })
      .finally(() => setProcessing(false));
  }

  /**
   * Checks two folders are not the same.
   * @param folder1
   * @param folder2
   * @returns
   */
  async function validateFolders(
    folder1: string,
    folder2: string
  ): Promise<boolean> {
    if (folder1.length === 0 || folder2.length === 0) {
      return true;
    }
    if (folder1 === folder2) {
      await message("Source and Destination folders cannot be the same.", {
        title: "RDR2PBC",
        kind: "error",
      });
      return false;
    }
    return true;
  }

  function openAboutAuthor() {
    shellOpen("https://buymeacoffee.com/wk5vozu");
  }

  return (
    <main className="mx-auto">
      <div className="flex flex-col items-stretch min-h-screen">
        <div className="h-24 bg-black flex flex-row place-items-center justify-center text-4xl  border-b-gray-500 border-b-2">
          <div>RDR</div>
          <div className="text-red-500">II</div>
          <div className="pl-1">Photo Backup</div>
        </div>
        <div className="absolute top-0 right-0 p-2">
          <button onClick={openAboutAuthor} className="hover:animate-pulse rounded-full bg-yellow-200 w-6 h-6" title="Buy me a coffee">
            <img src={BMCLogo} alt="aldnav's Github" className="w-4 h-4 pl-2" />
          </button>
        </div>
        <div className="min-h-32 grow bg-black grid grid-cols-2 grid-rows-1 gap-4 place-items-center">
          <div
            className="hover:border-2 hover:border-red-800 hover:cursor-pointer p-8 group"
            onClick={async () => {
              open({
                directory: true,
              }).then(handleSourceFolderSelection);
            }}
          >
            <div className="h-64 w-64 bg-source-folder bg-cover bg-no-repeat bg-center"></div>
            <div
              className={`w-64 text-md text-gray-200 group-hover:text-white ${
                sourceFolderSelected ? "text-xs text-clip" : ""
              }`}
            >
              {sourceFolderSelected ? sourceFolder : "Select Source Folder"}
            </div>
          </div>
          <div
            className="hover:border-2 hover:border-red-800 hover:cursor-pointer p-8 group"
            onClick={async () => {
              open({
                directory: true,
              }).then(async (result) => {
                if (result !== null) {
                  let isValid = await validateFolders(sourceFolder, result);
                  if (isValid) {
                    setDestinationFolder(result);
                    setDestinationFolderSelected(true);
                  }
                }
              });
            }}
          >
            <div className="h-64 w-64 bg-destination-folder bg-cover bg-no-repeat bg-center"></div>
            <div
              className={`w-64 text-md text-gray-200 group-hover:text-white ${
                destinationFolderSelected ? "text-xs text-clip" : ""
              }`}
            >
              {destinationFolderSelected
                ? destinationFolder
                : "Select Destination Folder"}
            </div>
          </div>
        </div>
        <div className="h-24 mb-4 bg-black border-t-gray-500 border-t-2 flex items-center justify-end">
          <div className="flex items-center">
            <input
              id="rm-checkbox"
              type="checkbox"
              className="accent-red-500"
              checked={removeOriginal}
              onChange={(e) => setRemoveOriginal(e.target.checked)}
            />
            <label
              className="switch hover:cursor-pointer"
              htmlFor="rm-checkbox"
            >
              <div className="pl-2 pr-4 text-gray-200">Remove Originals</div>
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="rm-checkbox"
              type="checkbox"
              className="accent-red-500"
              checked={convertToJPEG}
              onChange={(e) => setConvertToJPEG(e.target.checked)}
            />
            <label
              className="switch hover:cursor-pointer"
              htmlFor="rm-checkbox"
            >
              <div className="pl-2 pr-4 text-gray-200">Convert to JPEG</div>
            </label>
          </div>
          <div
            className={`pr-16 ${
              canStart() ? "text-gray-200" : "text-gray-800"
            } ${canStart() && !hasProcessed ? "animate-pulse" : ""}`}
          >
            <button
              className={`text-xl ${
                !canStart()
                  ? ""
                  : "hover:text-white hover:underline hover:underline-offset-4 hover:decoration-red-800"
              }`}
              disabled={!canStart()}
              onClick={start}
            >
              Start
            </button>
          </div>
        </div>
        <footer className="text-[10px] absolute bottom-0 right-0 p-2 text-gray-600">
          <p>version: {version}</p>
        </footer>
      </div>
    </main>
  );
}

export default App;
