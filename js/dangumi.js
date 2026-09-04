/*
 * Copyright (C) 2026 Yosuke-Kawakami
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  let charCount = parseInt(urlParams.get('c'), 10);
  if (isNaN(charCount) || charCount < 10) charCount = 20; 
  if (charCount > 40) charCount = 40;

  document.documentElement.style.setProperty('--tier-height', charCount + 'em');

  const source = document.getElementById('source-content');
  const renderArea = document.getElementById('render-area');

  const buildLayout = () => {
    renderArea.innerHTML = '';

    const mainTitleEl = document.getElementById('main-title');
    const mainTitleText = mainTitleEl ? mainTitleEl.innerHTML : '';
    // -----------------------------------------------------------------------------------

    source.style.display = 'block';
    const totalWidth = source.scrollWidth;

    const pElement = source.querySelector('p');
    if (!pElement) {
      source.style.display = 'none';
      return;
    }
    const computedStyle = window.getComputedStyle(pElement);
    const linePitch = parseFloat(computedStyle.lineHeight);
    const baseFontSize = parseFloat(computedStyle.fontSize);
    source.style.display = 'none';

    if (isNaN(linePitch) || linePitch <= 0) return;

    const measureDiv = document.createElement('div');
    measureDiv.style.position = 'absolute';
    measureDiv.style.visibility = 'hidden';
    document.body.appendChild(measureDiv);

    measureDiv.style.height = 'var(--tier-height)';
    const tierHeightPx = measureDiv.getBoundingClientRect().height;

    measureDiv.style.height = 'var(--tier-gap)';
    const gapPx = measureDiv.getBoundingClientRect().height;

    document.body.removeChild(measureDiv);

    const paddingPx = baseFontSize * 4; 
    const viewportHeight = window.innerHeight;

    let numTiers = Math.ceil((viewportHeight - paddingPx) / (tierHeightPx + gapPx));
    numTiers = Math.max(2, numTiers); 

    let currentOffset = 0;
    let isFirstWindow = true;
    let sanityGuard = 0;

    while (currentOffset < totalWidth && sanityGuard < 1000) {
      sanityGuard++;

      const windowDiv = document.createElement('div');
      windowDiv.className = 'vertical-window';

      if (isFirstWindow) {
        if (mainTitleText){
          const titleBlock = document.createElement('div');
          titleBlock.className = 'title-block';
          titleBlock.innerHTML = `<h1>${mainTitleText}</h1>`;
          windowDiv.appendChild(titleBlock);
        }
      }

      const tiersContainer = document.createElement('div');
      tiersContainer.className = 'tiers-container';
      windowDiv.appendChild(tiersContainer);
      
      renderArea.appendChild(windowDiv);
      const rawAvailableWidth = tiersContainer.clientWidth;

      let contentWidth = Math.floor(rawAvailableWidth / linePitch) * linePitch;
      if (contentWidth < linePitch) contentWidth = linePitch; 

      for (let i = 0; i < numTiers; i++) {
        if (currentOffset >= totalWidth) break; 

        const viewport = document.createElement('div');
        viewport.className = 'vertical-viewport';
        viewport.style.width = contentWidth + 'px';

        const clone = source.cloneNode(true);
        clone.removeAttribute('id');
        clone.className = 'vertical-content';
        clone.style.display = 'block';
        clone.style.transform = `translateX(${currentOffset}px)`;

        viewport.appendChild(clone);
        tiersContainer.appendChild(viewport);

        currentOffset += contentWidth;
      }

      isFirstWindow = false;
    }
  };

  buildLayout();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildLayout, 200);
  });
});
