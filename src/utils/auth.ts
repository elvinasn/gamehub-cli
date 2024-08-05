import open from "open";
import http from "http";
import url from "url";
import { login } from "./api.js";

const PORT = 4567;
const LOGIN_URL_BASE = "id.gamestarter.com";
const CLIENT_ID = "7d44caee-0891-4386-a02a-4cb8dbd11e3a";

const REDIRECT_URI = `http://localhost:${PORT}/callback`;

const getOauthUrl = (): URL => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
    scope: "user",
  });

  const oauthUrl = new URL(
    `/oauth2/authorize?${params}`,
    `https://${LOGIN_URL_BASE}`
  );
  return oauthUrl;
};

export const getAccessToken = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (req.url?.startsWith("/callback")) {
        const queryObject = url.parse(req.url, true).query;
        const code = queryObject.code as string;

        if (code) {
          try {
            const access_token = await login(code, REDIRECT_URI);
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(html(true));
            server.close();
            resolve(access_token);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(html(false));
            server.close();
            reject(e);
          }
        } else {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(html(false));
          server.close();
          reject(new Error("No token provided"));
        }
      }
    });
    server.on("error", (error) => {
      if ((error as unknown as any).code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Please kill the process using this port.`
        );
        reject(new Error(`Port ${PORT} is already in use.`));
      } else {
        console.error("Server error");
        reject(error);
      }
    });
    server.listen(PORT, () => {
      const oauthUrl = getOauthUrl();

      console.log(
        "Please proceed in your browser. If the browser does not open, please open the following URL in your browser:"
      );
      console.log(oauthUrl.toString());
      open(oauthUrl.toString());
    });
  });
};

const html = (isSuccess: boolean) => {
  const borderColor = isSuccess ? "#38A169" : "#E53E3E";
  const headerText = isSuccess ? "Login Successful" : "Login Failed";
  const message = isSuccess
    ? "You have successfully logged in to your account. You can close this window."
    : "Login failed. Please try again.";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Successful</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      font-family: Arial, sans-serif;
    }

    .container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: #11131B;
    }

    .card {
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 360px;
      padding: 1rem;
      border: 1px solid ${borderColor};
      border-radius: 16px;
    }

    .card h1 {
      text-align: center;
      font-size: 32px;
      color: #FFFFFF;
      margin: 0;
      margin-bottom: 8px;
    }

    .card p {
      text-align: center;
      font-size: 12px;
      color: #FFFFFF;
      margin: 0;
    }

    .mb-4 {
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 49 48" width="50px" height="50px" class="mb-4">
        <mask id="path-1-inside-1_381_841" fill="white">
        <path d="M0.966309 13.8297C0.966309 6.74407 6.71036 1 13.796 1H30.3667C37.4524 1 43.1965 6.74405 43.1965 13.8297V30.4004C43.1965 37.4861 37.4524 43.2301 30.3668 43.2301H13.796C6.71037 43.2301 0.966309 37.4861 0.966309 30.4004V13.8297Z" />
      </mask>
      <path
        d="M13.796 2.81271H30.3667V-0.812708H13.796V2.81271ZM41.3837 13.8297V30.4004H45.0092V13.8297H41.3837ZM30.3668 41.4174H13.796V45.0429H30.3668V41.4174ZM2.77902 30.4004V13.8297H-0.8464V30.4004H2.77902ZM13.796 41.4174C7.7115 41.4174 2.77902 36.485 2.77902 30.4004H-0.8464C-0.8464 38.4872 5.70924 45.0429 13.796 45.0429V41.4174ZM41.3837 30.4004C41.3837 36.485 36.4513 41.4174 30.3668 41.4174V45.0429C38.4535 45.0429 45.0092 38.4872 45.0092 30.4004H41.3837ZM30.3667 2.81271C36.4513 2.81271 41.3837 7.74519 41.3837 13.8297H45.0092C45.0092 5.74292 38.4535 -0.812708 30.3667 -0.812708V2.81271ZM13.796 -0.812708C5.70923 -0.812708 -0.8464 5.74294 -0.8464 13.8297H2.77902C2.77902 7.74519 7.7115 2.81271 13.796 2.81271V-0.812708Z"
        fill="white"
        mask="url(#path-1-inside-1_381_841)"
      />
      <mask id="path-3-inside-2_381_841" fill="white">
        <path d="M7.94739 18.8899C8.48945 12.6863 13.408 7.76777 19.6116 7.22571L33.7749 5.98814C41.2727 5.333 47.7213 11.2428 47.7213 18.7691V34.17C47.7213 41.2556 41.9773 46.9997 34.8916 46.9997H19.4908C11.9645 46.9997 6.05468 40.551 6.70982 33.0532L7.94739 18.8899Z" />
      </mask>
      <path
        d="M6.70982 33.0532L9.16126 33.2674L6.70982 33.0532ZM33.7749 5.98814L33.9891 8.43958L33.7749 5.98814ZM19.6116 7.22571L19.3974 4.77427L19.6116 7.22571ZM7.94739 18.8899L5.49595 18.6757L7.94739 18.8899ZM19.8258 9.67715L33.9891 8.43958L33.5606 3.53671L19.3974 4.77427L19.8258 9.67715ZM45.2606 18.7691V34.17H50.1821V18.7691H45.2606ZM34.8916 44.5389H19.4908V49.4604H34.8916V44.5389ZM9.16126 33.2674L10.3988 19.1041L5.49595 18.6757L4.25839 32.839L9.16126 33.2674ZM19.4908 44.5389C13.408 44.5389 8.63177 39.3271 9.16126 33.2674L4.25839 32.839C3.47758 41.7749 10.5209 49.4604 19.4908 49.4604V44.5389ZM45.2606 34.17C45.2606 39.8966 40.6182 44.5389 34.8916 44.5389V49.4604C43.3363 49.4604 50.1821 42.6147 50.1821 34.17H45.2606ZM33.9891 8.43958C40.0488 7.91009 45.2606 12.6864 45.2606 18.7691H50.1821C50.1821 9.79918 42.4966 2.7559 33.5606 3.53671L33.9891 8.43958ZM19.3974 4.77427C12.0039 5.4203 6.14198 11.2823 5.49595 18.6757L10.3988 19.1041C10.8369 14.0904 14.8121 10.1152 19.8258 9.67715L19.3974 4.77427Z"
        fill="white"
        mask="url(#path-3-inside-2_381_841)"
      />
      <mask id="path-5-inside-3_381_841" fill="white">
        <path d="M0.966309 13.8297C0.966309 6.74407 6.71036 1 13.796 1H30.3667C37.4524 1 43.1965 6.74405 43.1965 13.8297V30.4004C43.1965 37.4861 37.4524 43.2301 30.3668 43.2301H13.796C6.71037 43.2301 0.966309 37.4861 0.966309 30.4004V13.8297Z" />
      </mask>
      <path
        d="M0.966309 13.8297C0.966309 6.74407 6.71036 1 13.796 1H30.3667C37.4524 1 43.1965 6.74405 43.1965 13.8297V30.4004C43.1965 37.4861 37.4524 43.2301 30.3668 43.2301H13.796C6.71037 43.2301 0.966309 37.4861 0.966309 30.4004V13.8297Z"
        fill="black"
      />
      <path
        d="M13.796 2.35953H30.3667V-0.359531H13.796V2.35953ZM41.8369 13.8297V30.4004H44.556V13.8297H41.8369ZM30.3668 41.8706H13.796V44.5897H30.3668V41.8706ZM2.32584 30.4004V13.8297H-0.393223V30.4004H2.32584ZM13.796 41.8706C7.46122 41.8706 2.32584 36.7352 2.32584 30.4004H-0.393223C-0.393223 38.2369 5.95953 44.5897 13.796 44.5897V41.8706ZM41.8369 30.4004C41.8369 36.7352 36.7016 41.8706 30.3668 41.8706V44.5897C38.2033 44.5897 44.556 38.2369 44.556 30.4004H41.8369ZM30.3667 2.35953C36.7015 2.35953 41.8369 7.4949 41.8369 13.8297H44.556C44.556 5.9932 38.2032 -0.359531 30.3667 -0.359531V2.35953ZM13.796 -0.359531C5.95951 -0.359531 -0.393223 5.99322 -0.393223 13.8297H2.32584C2.32584 7.49491 7.46121 2.35953 13.796 2.35953V-0.359531Z"
        fill="white"
        mask="url(#path-5-inside-3_381_841)"
      />
      <path
        d="M13.8817 45.8029L10.8101 42.7843L18.873 42.407L34.2311 42.0297L38.0706 39.7658L41.1422 36.7472L42.678 32.2194V12.2214L41.9101 8.44824L45.3657 11.4668L46.9015 14.8627V37.5018L45.3657 41.6524L41.1422 44.6709L36.9187 46.1802H23.4805L13.8817 45.8029Z"
        fill="white"
      />
      <path
        d="M33.7613 19.6332C33.7587 19.5995 33.7556 19.5658 33.7521 19.5322C33.6502 18.0843 33.0042 16.7286 31.9437 15.7376C30.8832 14.7466 29.487 14.1937 28.0355 14.19H16.5519C15.0801 14.1833 13.6626 14.7455 12.5954 15.7592C11.5283 16.7728 10.894 18.1596 10.825 19.6298C10.8135 19.7205 10.8101 19.8147 10.8101 19.9203V27.3961C10.8101 28.4584 11.2384 29.4953 11.9837 30.2395C12.7402 30.9911 13.7629 31.4137 14.8293 31.4154C16.8964 31.4154 17.7048 30.267 18.8486 27.9703C19.0163 27.635 19.9878 25.6736 22.2937 25.6736C24.5858 25.6736 25.57 27.6338 25.7388 27.9703C26.8917 30.267 27.691 31.4154 29.7581 31.4154C30.8203 31.4154 31.8573 30.9871 32.6014 30.2418C33.353 29.4852 33.7756 28.4626 33.7773 27.3961V19.9318C33.7773 19.8227 33.7727 19.7251 33.7613 19.6332ZM16.5519 22.2641C16.246 22.271 15.9419 22.2168 15.6573 22.1045C15.3727 21.9923 15.1134 21.8243 14.8946 21.6105C14.6758 21.3966 14.5019 21.1412 14.3832 20.8593C14.2645 20.5773 14.2033 20.2745 14.2032 19.9686C14.2031 19.6626 14.2642 19.3598 14.3828 19.0778C14.5014 18.7957 14.6751 18.5403 14.8938 18.3263C15.1124 18.1124 15.3717 17.9443 15.6562 17.8319C15.9407 17.7195 16.2449 17.6651 16.5507 17.6718C17.1508 17.6851 17.7219 17.9328 18.1416 18.3618C18.5614 18.7909 18.7965 19.3672 18.7967 19.9674C18.7968 20.5676 18.562 21.1441 18.1424 21.5733C17.7229 22.0026 17.152 22.2505 16.5519 22.2641ZM28.0355 16.5223C28.3401 16.5223 28.6322 16.6433 28.8475 16.8587C29.0629 17.074 29.1839 17.3661 29.1839 17.6707C29.1839 17.9752 29.0629 18.2673 28.8475 18.4827C28.6322 18.6981 28.3401 18.819 28.0355 18.819C27.7309 18.819 27.4389 18.6981 27.2235 18.4827C27.0081 18.2673 26.8871 17.9752 26.8871 17.6707C26.8871 17.3661 27.0081 17.074 27.2235 16.8587C27.4389 16.6433 27.7309 16.5223 28.0355 16.5223ZM25.7388 21.1158C25.4342 21.1158 25.1421 20.9948 24.9268 20.7794C24.7114 20.5641 24.5904 20.272 24.5904 19.9674C24.5904 19.6628 24.7114 19.3707 24.9268 19.1554C25.1421 18.94 25.4342 18.819 25.7388 18.819C26.0433 18.819 26.3354 18.94 26.5508 19.1554C26.7662 19.3707 26.8871 19.6628 26.8871 19.9674C26.8871 20.272 26.7662 20.5641 26.5508 20.7794C26.3354 20.9948 26.0433 21.1158 25.7388 21.1158ZM28.0355 23.4125C27.7309 23.4125 27.4389 23.2915 27.2235 23.0761C27.0081 22.8608 26.8871 22.5687 26.8871 22.2641C26.8871 21.9596 27.0081 21.6675 27.2235 21.4521C27.4389 21.2367 27.7309 21.1158 28.0355 21.1158C28.3401 21.1158 28.6322 21.2367 28.8475 21.4521C29.0629 21.6675 29.1839 21.9596 29.1839 22.2641C29.1839 22.5687 29.0629 22.8608 28.8475 23.0761C28.6322 23.2915 28.3401 23.4125 28.0355 23.4125ZM30.3322 21.1158C30.0277 21.1158 29.7356 20.9948 29.5202 20.7794C29.3049 20.5641 29.1839 20.272 29.1839 19.9674C29.1839 19.6628 29.3049 19.3707 29.5202 19.1554C29.7356 18.94 30.0277 18.819 30.3322 18.819C30.6368 18.819 30.9289 18.94 31.1443 19.1554C31.3596 19.3707 31.4806 19.6628 31.4806 19.9674C31.4806 20.272 31.3596 20.5641 31.1443 20.7794C30.9289 20.9948 30.6368 21.1158 30.3322 21.1158Z"
        fill="white"
      />
      </svg>
      <h1>${headerText}</h1>
      <p>${message}</p>
    </div>
  </div>
</body>
</html>`;
};
