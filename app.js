        // Broadcast pengumuman secara live
        function publishAnnouncement() {
            const text = document.getElementById('announcement-text').value.trim();
            const durationSec = parseInt(document.getElementById('announcement-duration').value) || 10;

            if(!text) {
                alert('Pesan pengumuman tidak boleh kosong!');
                return;
            }

            const announcementData = {
                text: text,
                expiresAt: Date.now() + (durationSec * 1000)
            };

            // Simpan ke localStorage
            localStorage.setItem('activeAnnouncement', JSON.stringify(announcementData));
            
            // Panggil fungsi pengecekan langsung di perangkat pengirim
            checkDynamicIslandAnnouncement();

            alert('Pengumuman global berhasil disiarkan!');
            document.getElementById('announcement-text').value = '';
        }

        let lastRenderedAnnouncement = null;
        function checkDynamicIslandAnnouncement() {
            const rawData = localStorage.getItem('activeAnnouncement');
            const container = document.getElementById('dynamic-island-container');
            if(!container) return;

            if(!rawData) {
                container.innerHTML = '';
                lastRenderedAnnouncement = null;
                return;
            }

            const announcement = JSON.parse(rawData);
            const timeLeft = announcement.expiresAt - Date.now();

            if(timeLeft <= 0) {
                const islandEl = container.querySelector('#island-box');
                if(islandEl && !islandEl.classList.contains('animate-island-out')) {
                    islandEl.classList.remove('animate-island-in');
                    islandEl.classList.add('animate-island-out');
                    setTimeout(() => {
                        localStorage.removeItem('activeAnnouncement');
                        container.innerHTML = '';
                    }, 400);
                } else if (!islandEl) {
                    localStorage.removeItem('activeAnnouncement');
                }
                return;
            }

            if(lastRenderedAnnouncement !== announcement.expiresAt) {
                lastRenderedAnnouncement = announcement.expiresAt;
                const secRemaining = Math.ceil(timeLeft / 1000);
                container.innerHTML = `
                    <div id="island-box" class="bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700 pointer-events-auto animate-island-in transition-all">
                        <span class="text-amber-400 animate-pulse text-lg">📢</span>
                        <div class="text-xs font-medium tracking-wide">
                            <span class="font-bold text-indigo-300">Pengumuman:</span> ${announcement.text}
                        </div>
                        <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">${secRemaining}s</span>
                    </div>
                `;
            } else {
                const secEl = container.querySelector('#island-box span.font-mono');
                if(secEl) {
                    secEl.innerText = `${Math.ceil(timeLeft / 1000)}s`;
                }
            }
        }

        // TAMBAHAN: Event listener untuk mendeteksi perubahan storage secara real-time antar perangkat/tab
        window.addEventListener('storage', function(event) {
            if (event.key === 'activeAnnouncement') {
                checkDynamicIslandAnnouncement();
            }
        });
