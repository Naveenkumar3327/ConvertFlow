import { GridFSBucket, ObjectId } from "mongodb";
import mongoose from "mongoose";
import { connectDB } from "../db/connection";
import { Readable } from "stream";

// Retrieve a specific GridFS Bucket
export async function getGridFSBucket(
  bucketName: "originalFiles" | "convertedFiles" | "previewFiles"
): Promise<GridFSBucket> {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection not initialized.");
  }
  return new GridFSBucket(db as any, {
    bucketName,
  });
}

// Upload buffer as a stream to GridFS
export async function uploadBufferToGridFS(
  bucketName: "originalFiles" | "convertedFiles" | "previewFiles",
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<ObjectId> {
  const bucket = await getGridFSBucket(bucketName);
  const uploadStream = bucket.openUploadStream(filename, {
    metadata: { contentType },
  } as any);

  return new Promise((resolve, reject) => {
    const readable = new Readable();
    readable._read = () => {}; // _read is required but can be a no-op
    readable.push(buffer);
    readable.push(null);

    readable
      .pipe(uploadStream)
      .on("finish", () => {
        resolve(uploadStream.id as ObjectId);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

// Upload direct readable stream to GridFS
export async function uploadStreamToGridFS(
  bucketName: "originalFiles" | "convertedFiles" | "previewFiles",
  stream: Readable,
  filename: string,
  contentType: string
): Promise<ObjectId> {
  const bucket = await getGridFSBucket(bucketName);
  const uploadStream = bucket.openUploadStream(filename, {
    metadata: { contentType },
  } as any);

  return new Promise((resolve, reject) => {
    stream
      .pipe(uploadStream)
      .on("finish", () => {
        resolve(uploadStream.id as ObjectId);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

// Retrieve file download stream from GridFS
export async function getGridFSStream(
  bucketName: "originalFiles" | "convertedFiles" | "previewFiles",
  fileId: string | ObjectId
): Promise<Readable> {
  const bucket = await getGridFSBucket(bucketName);
  const objectId = typeof fileId === "string" ? new ObjectId(fileId) : fileId;
  return bucket.openDownloadStream(objectId);
}

// Delete file from GridFS Bucket
export async function deleteFromGridFS(
  bucketName: "originalFiles" | "convertedFiles" | "previewFiles",
  fileId: string | ObjectId
): Promise<void> {
  const bucket = await getGridFSBucket(bucketName);
  const objectId = typeof fileId === "string" ? new ObjectId(fileId) : fileId;
  
  // Verify file exists in GridFS bucket files collection
  const filesCol = mongoose.connection.db!.collection(`${bucketName}.files`);
  const exists = await filesCol.findOne({ _id: objectId });
  if (exists) {
    await bucket.delete(objectId);
  }
}
