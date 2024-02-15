import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import app from "../../firebase";

const CreateTweet = () => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState("");
  const [file, setFile] = useState(null);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    file && uploadMedia(file);
  }, [file]);

  // handle media upload
  const uploadMedia = (file) => {
    // Create a reference for the file
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setMediaUploadProgress(Math.round(progress));
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;

          default:
            break;
        }
      },
      (error) => {},
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          try {
            // set the media url to the state
            setMedia(downloadURL);
            console.log(media);
          } catch (error) {
            console.log(error);
          }
        });
      }
    );
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/tweets/", { content: content, media: media });
      // IMPLEMENT SOCKET TO UPDATE TIMELINE
      // temporary solution
      window.location.reload(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {currentUser && (
        <p className="font-bold pl-2 my-2">{currentUser.username}</p>
      )}
      <form action="" className="border-b-2 pb-6">
        <textarea
          className="bg-slate-200 rounded-lg w-full p-2 "
          type="text"
          maxLength={280}
          placeholder="What is happening?"
          onChange={(e) => setContent(e.target.value)}
        ></textarea>

        <span>
          {mediaUploadProgress > 0 && "Uploading: " + mediaUploadProgress + "%"}
        </span>
        <input
          type="file"
          className="bg-transparent border border-slate-500 rounded p-2"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <div>
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded-full ml-auto"
            onClick={handleSubmit}
          >
            Tweet
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTweet;
