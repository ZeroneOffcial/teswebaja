import express from "express";
import { Client } from "ssh2";

const app = express();
app.use(express.json());

app.post("/install", async (req, res) => {
  const { ip, user = "root", password, panel, node, ram, userpanel, email } = req.body;
  const conn = new Client();

  res.write("🔌 Connecting ke VPS...\n");

  conn.on("ready", () => {
    res.write("✅ Connected! Mulai instalasi Panel...\n");

    const passwordPanel = "admin" + Math.random().toString(36).substring(2, 8);
    const commandPanel = `bash <(curl -s https://pterodactyl-installer.se)`;

    // STEP 1: Install Panel
    conn.exec(commandPanel, (err, stream) => {
      if (err) {
        res.write("❌ Error: " + err.message);
        return res.end();
      }

      stream.on("close", () => {
        res.write("\n✅ Panel terinstall! Sekarang instalasi Wings...\n");

        // STEP 2: Install Wings
        conn.exec(`bash <(curl -s https://raw.githubusercontent.com/SkyzoOffc/Pterodactyl-Theme-Autoinstaller/main/createnode.sh)`, (err, wingsStream) => {
          if (err) {
            res.write("❌ Error instal wings: " + err.message);
            return res.end();
          }

          wingsStream.on("close", () => {
            res.write("\n🎉 Instalasi selesai!\n");
            res.write(`
📦 Detail Akun Panel:
- 🌐 Domain: ${panel}
- 👤 Username: ${userpanel}
- 🔑 Password: ${passwordPanel}
- 📧 Email: ${email}

⚡ Wings sudah dibuat di domain: ${node}
RAM Dialokasikan: ${ram} MB

👉 Silakan login ke panel lalu buat Allocation & Token Wings.
            `);
            res.end();
          });

          wingsStream.on("data", (data) => {
            const output = data.toString();
            res.write(output);

            if (output.includes("Masukkan nama lokasi:")) wingsStream.write("Singapore\n");
            if (output.includes("Masukkan deskripsi lokasi:")) wingsStream.write("Node by Installer\n");
            if (output.includes("Masukkan domain:")) wingsStream.write(`${node}\n`);
            if (output.includes("Masukkan nama node:")) wingsStream.write("NodeAuto\n");
            if (output.includes("Masukkan RAM")) wingsStream.write(`${ram}\n`);
            if (output.includes("jumlah maksimum disk")) wingsStream.write(`${ram}\n`);
            if (output.includes("Masukkan Locid:")) wingsStream.write("1\n");
          });

          wingsStream.stderr.on("data", (data) => res.write("ERR-WINGS: " + data.toString()));
        });
      });

      stream.on("data", (data) => {
        const output = data.toString();
        res.write(output);

        // Auto jawab prompt installer Panel
        if (output.includes("Input 0-6")) stream.write("0\n");
        if (output.includes("(y/N)")) stream.write("y\n");
        if (output.includes("Database username")) stream.write(`${userpanel}\n`);
        if (output.includes("Password (press enter")) stream.write(`${passwordPanel}\n`);
        if (output.includes("Select timezone")) stream.write("Asia/Jakarta\n");
        if (output.includes("Email address for the initial admin account")) stream.write(`${email}\n`);
        if (output.includes("Username for the initial admin account")) stream.write(`${userpanel}\n`);
        if (output.includes("First name")) stream.write(`${userpanel}\n`);
        if (output.includes("Last name")) stream.write(`${userpanel}\n`);
        if (output.includes("Password for the initial admin account")) stream.write(`${passwordPanel}\n`);
        if (output.includes("Set the FQDN of this panel")) stream.write(`${panel}\n`);
        if (output.includes("Do you want to automatically configure UFW")) stream.write("y\n");
        if (output.includes("Do you want to automatically configure HTTPS")) stream.write("y\n");
        if (output.includes("I agree")) stream.write("y\n");
        if (output.includes("(A)gree/(C)ancel")) stream.write("A\n");
      });

      stream.stderr.on("data", (data) => res.write("ERR-PANEL: " + data.toString()));
    });
  }).connect({ host: ip, port: 22, username: user, password });
});

app.listen(3000, () => console.log("Server jalan di http://localhost:3000"));
