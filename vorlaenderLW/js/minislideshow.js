/* Create an alert to show if the browser is IE or not */
if (isIE()){
//alert('Im Internet Explorer kann es zu Anzeigefehlern kommen. Denken Sie darüber den Browser zu wechseln.');
}else{
    //alert('It is NOT InternetExplorer');
}



var slideIndex = 1;
window.onload = showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  if(isIE()){
	  alert("Internet Explorer konnte die Fotoschau nicht darstellen. (Browser wechseln)");
	  return;
  }
  showSlides(slideIndex += n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  slides[slideIndex-1].style.display = "inline";
} 

/* Sample function that returns boolean in case the browser is Internet Explorer*/
function isIE() {
  ua = navigator.userAgent;
  /* MSIE used to detect old browsers and Trident used to newer ones*/
  var is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
  return is_ie; 
}