import { Button } from "frames.js/next";
import { frames } from "./frames";

const handleRequest = frames(async (ctx) => {
  return {
    image: (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        color: '#fff',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        <img 
          src="https://your-app.vercel.app/assets/brooklyn_sprite_excited.png" 
          alt="Brooklyn" 
          style={{ width: '200px', height: '200px' }}
        />
        <span>Welcome to Cipher City!</span>
      </div>
    ),
    buttons: [
      <Button action="post_redirect" target="https://your-app.vercel.app">
        Play Cipher City
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest; 