let isOwner = false;

function openLogin() {
  const pwd = prompt("Masukkan password admin:");
  if (pwd === "zerone") {   // ganti sesuai keinginan
    isOwner = true;
    document.getElementById('addBtn').onclick = openModal;
    openModal();
  } else {
    alert("Password salah!");
  }
}

function openModal() {
  document.getElementById('addModal').classList.remove('hidden');
  document.getElementById('addModal').classList.add('flex');
}

function closeModal() {
  document.getElementById('addModal').classList.add('hidden');
  document.getElementById('addModal').classList.remove('flex');
}

function closeView() {
  document.getElementById('viewModal').classList.add('hidden');
  document.getElementById('viewModal').classList.remove('flex');
}

document.getElementById('saveCodeBtn').onclick = async () => {
  const title = document.getElementById('titleInput').value;
  const desc = document.getElementById('descInput').value;
  const code = document.getElementById('codeInput').value;
  const lang = document.getElementById('langInput').value;

  if (!title || !code) { alert("Lengkapi judul dan kode!"); return; }

  await fetch('addcode.php', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({title,desc,code,lang})
  });

  alert("Kode disimpan!");
  closeModal();
  loadCodes();
};

async function loadCodes() {
  const res = await fetch('getcodes.php');
  const codes = await res.json();
  const list = document.getElementById('codeList');
  list.innerHTML = '';

  codes.forEach(c => {
    const div = document.createElement('div');
    div.className = 'bg-white p-3 rounded shadow cursor-pointer hover:bg-gray-50';
    div.innerHTML = `<h3 class="font-bold">${c.title}</h3><p class="text-sm text-gray-600">${c.desc}</p>`;
    div.onclick = () => viewCode(c);
    list.appendChild(div);
  });
}

function viewCode(c){
  document.getElementById('viewTitle').innerText = c.title;
  document.getElementById('viewDesc').innerText = c.desc;

  const codeEl = document.getElementById('viewCode');
  codeEl.className = c.lang;
  codeEl.textContent = c.code;

  document.getElementById('viewModal').classList.remove('hidden');
  document.getElementById('viewModal').classList.add('flex');
  hljs.highlightElement(codeEl);
}

document.getElementById('searchInput').addEventListener('input', e => {
  const val = e.target.value.toLowerCase();
  document.querySelectorAll('#codeList > div').forEach(div => {
    div.style.display = div.innerText.toLowerCase().includes(val) ? 'block' : 'none';
  });
});

window.onload = () => {
  loadCodes
