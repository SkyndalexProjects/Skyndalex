import fetch from "node-fetch";

let cachedID = {};

export default async function findClientID() {
  try {
    let sc = await fetch("https://soundcloud.com/")
      .then((r) => {
        return r.text();
      })
      .catch(() => {
        return false;
      });
    let scVersion = String(
      sc
        .match(/<script>window\.__sc_version="[0-9]{10}"<\/script>/)[0]
        .match(/[0-9]{10}/),
    );

    if (cachedID.version === scVersion) return cachedID.id;

    let scripts = sc.matchAll(/<script.+src="(.+)">/g);
    let clientid;
    for (let script of scripts) {
      let url = script[1];

      if (url && !url.startsWith("https://a-v2.sndcdn.com")) return;

      let scrf = await fetch(url)
        .then((r) => {
          return r.text();
        })
        .catch(() => {
          return false;
        });
      let id = scrf.match(/\("client_id=[A-Za-z0-9]{32}"\)/);

      if (id && typeof id[0] === "string") {
        clientid = id[0].match(/[A-Za-z0-9]{32}/)[0];
        break;
      }
    }
    cachedID.version = scVersion;
    cachedID.id = clientid;

    return clientid;
  } catch (e) {
    return false;
  }
}
