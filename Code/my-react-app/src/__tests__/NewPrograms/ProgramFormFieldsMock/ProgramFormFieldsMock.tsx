// EventFormFieldsMock.tsx
import { SelectChangeEvent } from "@mui/material";
import React from "react";

interface EventFormFieldsMockProps {
  handleChange: (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      | SelectChangeEvent<unknown>
  ) => void;
  setIsPreviewVisible: React.Dispatch<React.SetStateAction<boolean>>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteImage: (eventImgId: string) => void;
}

const ProgramFormFieldsMock: React.FC<EventFormFieldsMockProps> = ({
  handleChange,
  setIsPreviewVisible,
  handleImageUpload,
  handleDeleteImage,
}) => {
  return (
    <div data-testid="event-form-fields">
      EventFormFields
      <button
        data-testid="fill-event-name"
        onClick={() => {
          handleChange({
            target: { name: "programName", value: "Test Event" },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      >
        Fill Event Name
      </button>
      <button
        data-testid="fill-description"
        onClick={() => {
          handleChange({
            target: { name: "description", value: "This is a test event." },
          } as React.ChangeEvent<HTMLTextAreaElement>);
        }}
      >
        Fill Description
      </button>
      <button
        data-testid="fill-recurrence-type"
        onClick={() => {
          handleChange({
            target: { name: "recurrenceType", value: "none" },
          } as React.ChangeEvent<HTMLSelectElement>);
        }}
      >
        Fill Recurrence Type
      </button>
      <button
        data-testid="fill-address"
        onClick={() => {
          handleChange({
            target: { name: "address", value: "123 Mosque Street" },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      >
        Fill Address
      </button>
      <button
        data-testid="fill-start-date"
        onClick={() => {
          handleChange({
            target: { name: "startDate", value: "2025-01-01" },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      >
        Fill Start Date
      </button>
      <button
        data-testid="fill-end-date"
        onClick={() => {
          handleChange({
            target: { name: "endDate", value: "2025-01-02" },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      >
        Fill End Date
      </button>
      <button
        data-testid="fill-start-time"
        onClick={() => {
          handleChange({
            target: { name: "startTime", value: "10:00" },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      >
        Fill Start Time
      </button>
      <button
        data-testid="fill-end-time"
        onClick={() => {
          handleChange({
            target: { name: "endTime", value: "12:00" },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      >
        Fill End Time
      </button>
      <button
        data-testid="fill-category"
        onClick={() => {
          handleChange({
            target: { name: "category", value: "Islamic Studies" },
          } as React.ChangeEvent<HTMLSelectElement>);
        }}
      >
        Fill Category
      </button>
      <button
        data-testid="fill-capacity"
        onClick={() => {
          handleChange({
            target: { name: "capacity", value: "500" },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      >
        Fill Capacity
      </button>
      <button
        data-testid="fill-location"
        onClick={() => {
          handleChange({
            target: {
              name: "latitude",
              value: "99.0001",
            },
          } as React.ChangeEvent<HTMLInputElement>);
          handleChange({
            target: {
              name: "longitude",
              value: "-56.03833",
            },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      >
        Fill Location
      </button>
      <button
        data-testid="fill-isRegistrationRequired"
        onClick={() => {
          handleChange({
            target: { name: "isRegistrationRequired", value: false },
          } as unknown as React.ChangeEvent<HTMLInputElement>);
        }}
      >
        Fill isRegistrationRequired
      </button>
      <button
        data-testid="upload-file"
        onClick={() => {
          const file = new File(["test image"], "test-image.jpg", {
            type: "image/jpeg",
            size: 8 * 1024 * 1024,
          });
          const e = {
            target: {
              files: [file],
            },
          } as unknown as React.ChangeEvent<HTMLInputElement>;

          handleImageUpload(e);
        }}
      >
        Upload File
      </button>
      <button
        data-testid="delete-file"
        onClick={() => {
          handleDeleteImage("eventid");
        }}
      >
        Delete Image
      </button>
      <button
        onClick={() => {
          setIsPreviewVisible(true);
        }}
      >
        Next
      </button>
    </div>
  );
};

export default ProgramFormFieldsMock;
