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
    const source     = document.querySelector('.source-content');
    const renderArea = document.querySelector('.render-area');

    const buildLayout = () => {
        renderArea.innerHTML = '';

        // 1. URLから 'c' パラメータを取得
        const params = new URLSearchParams(window.location.search);
        const rawChars = parseInt(params.get('c'), 10);

        // 2. ガード処理とデフォルト値の設定
        // パラメータがない、または数値以外の場合はデフォルトの 20 とする
        // 破壊的レイアウトを防ぐため、最小10文字〜最大40文字の範囲に制限
        const charCount = isNaN(rawChars) ? 20 : Math.max(10, Math.min(rawChars, 40));

        // 3. 高さを計算してCSSを動的に上書き
        const targetHeight  = (charCount) + 'em';
        source.style.height = targetHeight;

        // 全体の横幅を計測
        source.style.display = 'block';
        const totalWidth     = source.scrollWidth;
        const rawWidth       = renderArea.clientWidth;
        source.style.display = 'none';

        if (rawWidth === 0) return;

        // 1行の幅（linePitch）と1emのサイズ（fontSize）を取得
        const pElement      = source.querySelector('p');
        const computedStyle = window.getComputedStyle(pElement);
        const linePitch     = parseFloat(computedStyle.lineHeight);
        const fontSize      = parseFloat(computedStyle.fontSize);

        // 外枠（.vertical-window）のCSSに設定した padding や border を計算から引く
        // padding は左右 1em ずつ（合計2em分）、border は右 1px
        const paddingLeftRight = fontSize * 2;
        const borderWidth      = 1;
        const availableWidth   = rawWidth - paddingLeftRight - borderWidth;

        // テキスト表示幅を linePitch の倍数に丸める（端数切り捨て）
        const contentWidth = Math.floor(availableWidth / linePitch) * linePitch;

        if (contentWidth < linePitch) return; // 画面が狭すぎる場合のガード

        // 必要なブロック（段）の数を、純粋なコンテンツ幅で計算
        const numBlocks = Math.ceil(totalWidth / contentWidth);

        for (let i = 0; i < numBlocks; i++) {
            // 1. 外枠を生成（CSSでスタイルは定義済み）
            const windowDiv = document.createElement('div');
            windowDiv.className = 'vertical-window';

            // 2. 内枠（マスク）を生成し、計算した純粋な幅をセット
            const viewportDiv = document.createElement('div');
            viewportDiv.className = 'vertical-viewport';
            viewportDiv.style.width = (contentWidth + 2) + 'px';
            viewportDiv.style.height = targetHeight;

            // 3. テキストを複製し、シフトさせる
            const clone = source.cloneNode(true);
            clone.className = 'vertical-content';
            clone.style.display = 'block';

            // シフト量（translateX）はパディングを含まない contentWidth を使う
            clone.style.transform = `translateX(${i * contentWidth}px)`;

            // 段組み
            viewportDiv.appendChild(clone);
            windowDiv.appendChild(viewportDiv);
            renderArea.appendChild(windowDiv);
        }

        const body = document.body;

        // 描画されたコンテンツの自然な高さを正確に測るため、
        // 一旦 body の display スタイルを 'block' に変更して無効化する
        body.style.display = 'block';

        // ページ全体の高さが、ブラウザの表示領域に収まるか判定する
        if (document.documentElement.scrollHeight <= window.innerHeight) {
            // 1画面にピタッと収まる場合は、運用ポリシー通り grid を適用する
            body.style.display = 'grid';
        }
        // はみ出す（スクロールが必要な）場合は 'block' のままにして自然なスクロールに任せる

    };

    // 初回描画
    buildLayout();

    // 画面サイズ変更時のレスポンシブ対応
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(buildLayout, 200);
    });
});
