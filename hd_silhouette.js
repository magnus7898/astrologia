/* hd_silhouette.js — body silhouette as plain transparent blue, nothing else.
   Self-injecting; hd.html only needs   <script src="hd_silhouette.js"></script>
   The silhouette is the single path.st0 of human_prepared.svg.             */
(function(){
'use strict';
const css=document.createElement('style');
css.textContent='svg path.st0{fill:#9FE6FF!important;fill-opacity:.2!important;stroke:none!important}';
document.head.appendChild(css);
})();
