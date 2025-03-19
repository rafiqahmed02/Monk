export const getEventMessage = (
  shareDetails: {
    masjidName: any;
    name: any;
    date: { startDate: any; endDate: any };
    startTime: any;
    endTime: any;
    location: any;
  },
  shareUrl: any,
  isRegistrationRequired: any
) => `
Assalamualaikum!\n\nJoin ${shareDetails.masjidName} for ${
  shareDetails.name
}! ✨\n\n📅 Date: ${shareDetails.date.startDate} to ${
  shareDetails.date.endDate
}\n🕰️ Time: ${shareDetails.startTime} to ${
  shareDetails.endTime
}\n📍 Location: ${shareDetails.location}\n\n${
  isRegistrationRequired ? "Register now" : "RSVP now"
} using the ConnectMasjid app or the Masjid’s website.\n\n${shareUrl}\n\nJazakAllah Khair!`;

export const getServiceMessage = (
  shareDetails: {
    masjidName: any;
    name: any;
    metaData: { days: any[] };
    timing: { customStartEndTime: any[]; time: any[] };
  },
  shareUrl: any,
  isRegistrationRequired: any
) => {
  const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  const formattedTimes = shareDetails.timing?.time
    .map((time: string) => time.replace("After ", "")) // Remove "After" prefix
    .sort((a: string, b: string) => {
      // Sort based on the order in the prayerOrder array
      return prayerOrder.indexOf(a) - prayerOrder.indexOf(b);
    })
    .join(", ");

  const appointmentText = isRegistrationRequired
    ? "Book an appointment today using the ConnectMasjid app or the Masjid’s website."
    : "No appointment necessary! For more details, check out the ConnectMasjid app or visit the Masjid’s website.";

  return `Assalamualaikum!\n\n${shareDetails.masjidName} is offering ${
    shareDetails.name
  } services.\n\n📅 Available Days: ${
    shareDetails.metaData?.days.length > 0
      ? "Weekly " + shareDetails.metaData.days.join(", ")
      : "All days"
  }${
    shareDetails.timing?.customStartEndTime?.length > 0
      ? `\n\n🕰️ Available Timings: ${shareDetails.timing.customStartEndTime.join(
          ", "
        )}`
      : formattedTimes
      ? `\n\n🕰️ Available Timings: After ${formattedTimes}`
      : ""
  } \n\n${appointmentText}\n\n${shareUrl}`;
};

export const getProgramMessage = (
  shareDetails: {
    masjidName: any;
    name: any;
    ageRange: any;
    date: { startDate: any; endDate: any };
    startTime: any;
    endTime: any;
    location: any;
  },
  shareUrl: any,
  isRegistrationRequired: any
) => `
Assalamualaikum!\n\n${shareDetails.masjidName} is starting a program: ${
  shareDetails.name
}.\n\nFor ${
  shareDetails.ageRange === 0
    ? "all ages"
    : `Ages ${shareDetails.ageRange.minAge} to ${shareDetails.ageRange.maxAge}`
}.\n\n📅 Duration: ${shareDetails.date.startDate} to ${
  shareDetails.date.endDate
}\n🕰️ Time: ${shareDetails.startTime} to ${
  shareDetails.endTime
}\n📍 Location: ${shareDetails.location}\n\n${
  isRegistrationRequired ? "Register now" : "RSVP now"
} using the ConnectMasjid app or the Masjid’s website.\n\n${shareUrl}\n\nJazakAllah Khair!`;

export const getDonationMessage = (
  shareDetails: { masjidName: any; name: any },
  shareUrl: any
) => `
Assalamualaikum!\n\n${shareDetails.masjidName} is currently supporting the ${shareDetails.name} cause.\n\nSupport the ${shareDetails.masjidName} initiative now!\n\nUse the ConnectMasjid app or the Masjid’s website today to make a donation.\n\n${shareUrl}\n\nMay Allah (SWT) reward you abundantly for your contributions.\n\nJazakAllah Khair!`;
