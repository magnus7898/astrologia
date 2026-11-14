/* hd_silhouette.js — body silhouette in its original light blue (#D9FFFC),
   flat and see-through. Change OPACITY to make it more / less transparent.
   Self-injecting; hd.html only needs   <script src="hd_silhouette.js"></script>
   The silhouette is the single path.st0 of human_prepared.svg.             */
(function(){
'use strict';
const OPACITY=.3;
const css=document.createElement('style');
css.textContent=`svg path.st0{fill:#D9FFFC!important;fill-opacity:${OPACITY}!important;stroke:none!important}`;
document.head.appendChild(css);
})();
