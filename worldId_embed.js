// Hosted on workers.cloudflare.com

const gameId = 12519560096;

const privacyStates = {
    0: "🛡️ Safe Mode",
    1: "🌐 Public",
    2: "⛔ Private",
    3: "🔐 Whitelist",
    4: "🗑️ Taken Down"
}

async function getNamesFromUserId(userId) {
  const url = `https://users.roblox.com/v1/users/${userId}`;
  const response = await fetch(url);
  const data = await response.json();
  
  return data.name ? { name: data.name, displayName: data.displayName } : "N/A";
}

function formatISODateToHumanReadable(isoDateString) {
  const date = new Date(isoDateString);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const amPm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = months[month];

  return `${monthName} ${day}, ${year} ${hours}:${minutes} ${amPm}`;
}

function APIUnavailable() {
  return new Response(`<!DOCTYPE html>
  <html>
      <head>
          <meta charset="utf-8">
          <meta name="robots" content="noindex">
          <meta name="theme-color" content="#313131">
          <meta property="og:site_name" content="Wubby World">
          <meta property="og:title" content="Unknown World Info">
          <meta property="og:description" content="Couldn't retrieve world info, Please try again later.">
      </head>
      <body>
          <h1>Unknown World Info</h1>
          <p>Couldn't retrieve world info, Please try again later.</p>
      </body>
  </html>`, { status: 200, headers: { "content-type": "text/html; charset=UTF-8" } });
}

function InvalidWorldID() {
  return new Response(`<!DOCTYPE html>
  <html>
      <head>
          <meta charset="utf-8">
          <meta name="robots" content="noindex">
          <meta name="theme-color" content="#f44242">
          <meta property="og:site_name" content="Wubby World">
          <meta property="og:title" content="Invalid World ID">
          <meta property="og:description" content="Please specify a valid world id.">
      </head>
      <body>
          <h1>Invalid World ID.</h1>
          <p>Please specify a valid world id.</p>
      </body>
  </html>`, { status: 200, headers: { "content-type": "text/html; charset=UTF-8" } });
}

async function generateWorldInfoEmbed(apiData) {

  const creatorNames = await getNamesFromUserId(apiData.creator);
  const sanitizedWorldName = apiData.name.replace(/<[^>]*>/g, "");
  const sanitizedWorldDescription = apiData.description.replace(/<[^>]*>/g, "");
  const worldCreationTimestamp = formatISODateToHumanReadable(apiData.createdOn)

  /*
    const nameText = creatorNames.name === creatorNames.displayName
    ? `@${creatorNames.name}`
    : `${creatorNames.displayName} (@${creatorNames.name})`;
  */


  return new Response(`<!DOCTYPE html>
  <html>
      <head>
          <meta charset="utf-8">
          <meta name="robots" content="noindex">
          <meta name="theme-color" content="${apiData.isFeatured ? `#ffd758` : `#2aa078`}">
          <meta property="og:site_name" content="Wubby World">
          <meta property="og:title" content="${sanitizedWorldName}">
          <meta property="og:description" content="Created by ${creatorNames.name}\nBlocks: ${apiData.blocks}\nVisits: ${apiData.visits}\nActive Players: ${apiData.activePlayers}/${apiData.maxPlayers}\nWorld Status: ${privacyStates[apiData.worldPrivacyState]}\nCreated on ${worldCreationTimestamp} (UTC+0)\n\nDescription: ${sanitizedWorldDescription}">
          <meta content="https://assetdelivery.roblox.com/v1/asset/?id=${apiData.worldThumbnailId}" property='og:image'>
      </head>
      <body>
          <p>_choke says hi</p>
      </body>
  </html>`, { status: 200, headers: { "content-type": "text/html; charset=UTF-8" } });
}

var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const parts = path.split("/");
    const worldId = Number(parts[2]);
    const userAgent = request.headers.get('User-Agent') || '';
    const isDiscordCrawler = userAgent.includes('Discordbot')

    if (isNaN(worldId) || worldId < 1) {
      return InvalidWorldID();
    }

    try {
      // Sending a GET request to the API endpoint
      const apiResponse = await fetch(`https://api.wubbygame.com/worlds/worldId/${worldId}`);

      if (isDiscordCrawler) {
        if (apiResponse.status === 404) return InvalidWorldID();
        if (!apiResponse.ok) return APIUnavailable();
        
        const responseData = await apiResponse.json();

        // Generate HTML based on API response data
        const worldInfoEmbed = generateWorldInfoEmbed(responseData);

        return worldInfoEmbed;
      }

      //if (!apiResponse.ok) return APIUnavailable();
      if (apiResponse.status === 404) return InvalidWorldID();

      const base64LaunchData = btoa(`{"worldId": "${worldId}","time": "${Math.round((Date.now() + (25 * 1000)) / 1000)}"}`);

      // Redirect to the target URL
      const targetUrl = `https://www.roblox.com/games/start?placeId=${gameId}&launchData=${base64LaunchData}`;
      return Response.redirect(targetUrl, 302);

    } catch (error) {
      // Handle any errors that occur during the fetch request
      console.error("Error fetching data from the API:", error);
      return new Response("An error occurred while fetching data", {
        status: 500,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }
  },
};

export { worker_default as default };
