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

const EventFormFieldsMock: React.FC<EventFormFieldsMockProps> = ({
  handleChange,
  setIsPreviewVisible,
  handleImageUpload,
  handleDeleteImage,
}) => {
  return (
    <div data-testid="event-form-fields">
      EventFormFields
      {/* Button to simulate filling the 'eventName' field */}
      <button
        data-testid="fill-event-name"
        onClick={() => {
          handleChange({
            target: { name: "eventName", value: "Test Event" },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      >
        Fill Event Name
      </button>
      {/* Button to simulate filling the 'description' field */}
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
      {/* Button to simulate filling the 'recurrenceType' field */}
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
      {/* Button to simulate filling the 'address' field */}
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
      {/* Button to simulate filling the 'startDate' field */}
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
      {/* Button to simulate filling the 'endDate' field */}
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
      {/* Button to simulate filling the 'startTime' field */}
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
      {/* Button to simulate filling the 'endTime' field */}
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
      {/* Button to simulate filling the 'category' field */}
      <button
        data-testid="fill-category"
        onClick={() => {
          handleChange({
            target: { name: "category", value: "Islamic Event" },
          } as React.ChangeEvent<HTMLSelectElement>);
        }}
      >
        Fill Category
      </button>
      {/* Button to simulate filling the 'capacity' field */}
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
      {/* Button to simulate filling the 'location' fields */}
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
      {/* Button to simulate filling the 'isRegistrationRequired' field */}
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
      {/* Button to simulate uploading a file */}
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
      {/* Button to simulate deleting an image */}
      <button
        data-testid="delete-file"
        onClick={() => {
          handleDeleteImage("eventid");
        }}
      >
        Delete Image
      </button>
      {/* Button to navigate to the next step (preview) */}
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

export default EventFormFieldsMock;
