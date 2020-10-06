// Utility function
function Util () {};

/* 
	class manipulation functions
*/
Util.hasClass = function(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	if (el.classList) el.classList.add(classList[0]);
 	else if (!Util.hasClass(el, classList[0])) el.className += " " + classList[0];
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	if (el.classList) el.classList.remove(classList[0]);	
	else if(Util.hasClass(el, classList[0])) {
		var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
		el.className=el.className.replace(reg, ' ');
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* 
  DOM manipulation
*/
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length,
    returnArr = [];

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* 
	Animate height of an element
*/
Util.setHeight = function(start, to, element, duration, cb) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    var val = parseInt((progress/duration)*change + start);
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* 
	Smooth Scroll
*/

Util.scrollTo = function(final, duration, cb) {
  var start = window.scrollY || document.documentElement.scrollTop,
      currentTime = null;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    window.scrollTo(0, val);
    if(progress < duration) {
        window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* 
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* 
  Misc
*/

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
    return jsProperty in document.body.style;
  }
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* 
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1); 
		return null;
	};
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

/* 
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};
// File#: _1_accordion
(function() {
	var Accordion = function(element) {
		this.element = element;
		this.items = Util.getChildrenByClassName(this.element, 'js-accordion__item');
		this.showClass = 'accordion__item--is-open';
		this.animateHeight = (this.element.getAttribute('data-animation') == 'on');
		this.multiItems = !(this.element.getAttribute('data-multi-items') == 'off'); 
		this.initAccordion();
	};

	Accordion.prototype.initAccordion = function() {
		//set initial aria attributes
		for( var i = 0; i < this.items.length; i++) {
			var button = this.items[i].getElementsByTagName('button')[0],
				content = this.items[i].getElementsByClassName('js-accordion__panel')[0],
				isOpen = Util.hasClass(this.items[i], this.showClass) ? 'true' : 'false';
			Util.setAttributes(button, {'aria-expanded': isOpen, 'aria-controls': 'accordion-content-'+i, 'id': 'accordion-header-'+i});
			Util.addClass(button, 'js-accordion__trigger');
			Util.setAttributes(content, {'aria-labelledby': 'accordion-header-'+i, 'id': 'accordion-content-'+i});
		}

		//listen for Accordion events
		this.initAccordionEvents();
	};

	Accordion.prototype.initAccordionEvents = function() {
		var self = this;

		this.element.addEventListener('click', function(event) {
			var trigger = event.target.closest('.js-accordion__trigger');
			//check index to make sure the click didn't happen inside a children accordion
			if( trigger && Util.getIndexInArray(self.items, trigger.parentElement) >= 0) self.triggerAccordion(trigger);
		});
	};

	Accordion.prototype.triggerAccordion = function(trigger) {
		var self = this;
		var bool = (trigger.getAttribute('aria-expanded') === 'true');

		this.animateAccordion(trigger, bool);
	};

	Accordion.prototype.animateAccordion = function(trigger, bool) {
		var self = this;
		var item = trigger.closest('.js-accordion__item'),
			content = item.getElementsByClassName('js-accordion__panel')[0],
			ariaValue = bool ? 'false' : 'true';

		if(!bool) Util.addClass(item, this.showClass);
		trigger.setAttribute('aria-expanded', ariaValue);

		if(this.animateHeight) {
			//store initial and final height - animate accordion content height
			var initHeight = bool ? content.offsetHeight: 0,
				finalHeight = bool ? 0 : content.offsetHeight;
		}

		if(window.requestAnimationFrame && this.animateHeight) {
			Util.setHeight(initHeight, finalHeight, content, 200, function(){
				self.resetContentVisibility(item, content, bool);
			});
		} else {
			self.resetContentVisibility(item, content, bool);
		}

		if( !this.multiItems && !bool) this.closeSiblings(item);

	};

	Accordion.prototype.resetContentVisibility = function(item, content, bool) {
		Util.toggleClass(item, this.showClass, !bool);
		content.removeAttribute("style");
	};

	Accordion.prototype.closeSiblings = function(item) {
		//if only one accordion can be open -> search if there's another one open
		var index = Util.getIndexInArray(this.items, item);
		for( var i = 0; i < this.items.length; i++) {
			if(Util.hasClass(this.items[i], this.showClass) && i != index) {
				this.animateAccordion(this.items[i].getElementsByClassName('js-accordion__trigger')[0], true);
				return false;
			}
		}
	};
	
	//initialize the Accordion objects
	var accordions = document.getElementsByClassName('js-accordion');
	if( accordions.length > 0 ) {
		for( var i = 0; i < accordions.length; i++) {
			(function(i){new Accordion(accordions[i]);})(i);
		}
	}
}());
(function() {
    var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
    if( menuBtns.length > 0 ) {
      for(var i = 0; i < menuBtns.length; i++) {(function(i){
        initMenuBtn(menuBtns[i]);
      })(i);}
  
      function initMenuBtn(btn) {
        btn.addEventListener('click', function(event){	
          event.preventDefault();
          var status = !Util.hasClass(btn, 'anim-menu-btn--state-b');
          Util.toggleClass(btn, 'anim-menu-btn--state-b', status);
          // emit custom event
          var event = new CustomEvent('anim-menu-btn-clicked', {detail: status});
          btn.dispatchEvent(event);
        });
      };
    }
  }());
(function() {
    var Carousel = function(opts) {
      this.options = Util.extend(Carousel.defaults , opts);
      this.element = this.options.element;
      this.listWrapper = this.element.getElementsByClassName('carousel__wrapper')[0];
      this.list = this.element.getElementsByClassName('carousel__list')[0];
      this.items = this.element.getElementsByClassName('carousel__item');
      this.initItems = []; // store only the original elements - will need this for cloning
      this.itemsNb = this.items.length; //original number of items
      this.visibItemsNb = 1; // tot number of visible items
      this.itemsWidth = 1; // this will be updated with the right width of items
      this.itemOriginalWidth = false; // store the initial width to use it on resize
      this.selectedItem = 0; // index of first visible item 
      this.translateContainer = 0; // this will be the amount the container has to be translated each time a new group has to be shown (negative)
      this.containerWidth = 0; // this will be used to store the total width of the carousel (including the overflowing part)
      this.ariaLive = false;
      // navigation
      this.controls = this.element.getElementsByClassName('js-carousel__control');
      this.animating = false;
      // autoplay
      this.autoplayId = false;
      this.autoplayPaused = false;
      //drag
      this.dragStart = false;
      // resize
      this.resizeId = false;
      // used to re-initialize js
      this.cloneList = [];
      // store items min-width
      this.itemAutoSize = false;
      // store translate value (loop = off)
      this.totTranslate = 0;
      // modify loop option if navigation is on
      if(this.options.nav) this.options.loop = false;
      // store counter elements (if present)
      this.counter = this.element.getElementsByClassName('js-carousel__counter');
      this.counterTor = this.element.getElementsByClassName('js-carousel__counter-tot');
      initCarouselLayout(this); // get number visible items + width items
      setItemsWidth(this, true); 
      insertBefore(this, this.visibItemsNb); // insert clones before visible elements
      updateCarouselClones(this); // insert clones after visible elements
      resetItemsTabIndex(this); // make sure not visible items are not focusable
      initAriaLive(this); // set aria-live region for SR
      initCarouselEvents(this); // listen to events
      initCarouselCounter(this);
      Util.addClass(this.element, 'carousel--loaded');
    };
    
    //public carousel functions
    Carousel.prototype.showNext = function() {
      showNextItems(this);
    };
  
    Carousel.prototype.showPrev = function() {
      showPrevItems(this);
    };
  
    Carousel.prototype.startAutoplay = function() {
      startAutoplay(this);
    };
  
    Carousel.prototype.pauseAutoplay = function() {
      pauseAutoplay(this);
    };
    
    //private carousel functions
    function initCarouselLayout(carousel) {
      // evaluate size of single elements + number of visible elements
      var itemStyle = window.getComputedStyle(carousel.items[0]),
        containerStyle = window.getComputedStyle(carousel.listWrapper),
        itemWidth = parseFloat(itemStyle.getPropertyValue('width')),
        itemMargin = parseFloat(itemStyle.getPropertyValue('margin-right')),
        containerPadding = parseFloat(containerStyle.getPropertyValue('padding-left')),
        containerWidth = parseFloat(containerStyle.getPropertyValue('width'));
  
      if(!carousel.itemAutoSize) {
        carousel.itemAutoSize = itemWidth;
      }
  
      // if carousel.listWrapper is hidden -> make sure to retrieve the proper width
      containerWidth = getCarouselWidth(carousel, containerWidth);
  
      if( !carousel.itemOriginalWidth) { // on resize -> use initial width of items to recalculate 
        carousel.itemOriginalWidth = itemWidth;
      } else {
        itemWidth = carousel.itemOriginalWidth;
      }
  
      if(carousel.itemAutoSize) {
        carousel.itemOriginalWidth = parseInt(carousel.itemAutoSize);
        itemWidth = carousel.itemOriginalWidth;
      }
      // make sure itemWidth is smaller than container width
      if(containerWidth < itemWidth) {
        carousel.itemOriginalWidth = containerWidth
        itemWidth = carousel.itemOriginalWidth;
      }
      // get proper width of elements
      carousel.visibItemsNb = parseInt((containerWidth - 2*containerPadding + itemMargin)/(itemWidth+itemMargin));
      carousel.itemsWidth = parseFloat( (((containerWidth - 2*containerPadding + itemMargin)/carousel.visibItemsNb) - itemMargin).toFixed(1));
      carousel.containerWidth = (carousel.itemsWidth+itemMargin)* carousel.items.length;
      carousel.translateContainer = 0 - ((carousel.itemsWidth+itemMargin)* carousel.visibItemsNb);
      // flexbox fallback
      if(!flexSupported) carousel.list.style.width = (carousel.itemsWidth + itemMargin)*carousel.visibItemsNb*3+'px';
      
      // this is used when loop == off
      carousel.totTranslate = 0 - carousel.selectedItem*(carousel.itemsWidth+itemMargin);
      if(carousel.items.length <= carousel.visibItemsNb) carousel.totTranslate = 0;
  
      centerItems(carousel); // center items if carousel.items.length < visibItemsNb
      alignControls(carousel); // check if controls need to be aligned to a different element
    };
  
    function setItemsWidth(carousel, bool) {
      for(var i = 0; i < carousel.items.length; i++) {
        carousel.items[i].style.width = carousel.itemsWidth+"px";
        if(bool) carousel.initItems.push(carousel.items[i]);
      }
    };
  
    function updateCarouselClones(carousel) { 
      if(!carousel.options.loop) return;
      // take care of clones after visible items (needs to run after the update of clones before visible items)
      if(carousel.items.length < carousel.visibItemsNb*3) {
        insertAfter(carousel, carousel.visibItemsNb*3 - carousel.items.length, carousel.items.length - carousel.visibItemsNb*2);
      } else if(carousel.items.length > carousel.visibItemsNb*3 ) {
        removeClones(carousel, carousel.visibItemsNb*3, carousel.items.length - carousel.visibItemsNb*3);
      }
      // set proper translate value for the container
      setTranslate(carousel, 'translateX('+carousel.translateContainer+'px)');
    };
  
    function initCarouselEvents(carousel) {
      // listen for click on previous/next arrow
      // dots navigation
      if(carousel.options.nav) {
        carouselCreateNavigation(carousel);
        carouselInitNavigationEvents(carousel);
      }
  
      if(carousel.controls.length > 0) {
        carousel.controls[0].addEventListener('click', function(event){
          event.preventDefault();
          showPrevItems(carousel);
          updateAriaLive(carousel);
        });
        carousel.controls[1].addEventListener('click', function(event){
          event.preventDefault();
          showNextItems(carousel);
          updateAriaLive(carousel);
        });
  
        // update arrow visility -> loop == off only
        resetCarouselControls(carousel);
      }
      // autoplay
      if(carousel.options.autoplay) {
        startAutoplay(carousel);
        // pause autoplay if user is interacting with the carousel
        carousel.element.addEventListener('mouseenter', function(event){
          pauseAutoplay(carousel);
          carousel.autoplayPaused = true;
        });
        carousel.element.addEventListener('focusin', function(event){
          pauseAutoplay(carousel);
          carousel.autoplayPaused = true;
        });
        carousel.element.addEventListener('mouseleave', function(event){
          carousel.autoplayPaused = false;
          startAutoplay(carousel);
        });
        carousel.element.addEventListener('focusout', function(event){
          carousel.autoplayPaused = false;
          startAutoplay(carousel);
        });
      }
      // drag events
      if(carousel.options.drag && window.requestAnimationFrame) {
        //init dragging
        new SwipeContent(carousel.element);
        carousel.element.addEventListener('dragStart', function(event){
          if(event.detail.origin && event.detail.origin.closest('.js-carousel__control')) return;
          if(event.detail.origin && event.detail.origin.closest('.js-carousel__navigation')) return;
          if(event.detail.origin && !event.detail.origin.closest('.carousel__wrapper')) return;
          Util.addClass(carousel.element, 'carousel--is-dragging');
          pauseAutoplay(carousel);
          carousel.dragStart = event.detail.x;
          animateDragEnd(carousel);
        });
        carousel.element.addEventListener('dragging', function(event){
          if(!carousel.dragStart) return;
          if(carousel.animating || Math.abs(event.detail.x - carousel.dragStart) < 10) return;
          var translate = event.detail.x - carousel.dragStart + carousel.translateContainer;
          if(!carousel.options.loop) {
            translate = event.detail.x - carousel.dragStart + carousel.totTranslate; 
          }
          setTranslate(carousel, 'translateX('+translate+'px)');
        });
      }
      // reset on resize
      window.addEventListener('resize', function(event){
        pauseAutoplay(carousel);
        clearTimeout(carousel.resizeId);
        carousel.resizeId = setTimeout(function(){
          resetCarouselResize(carousel);
          // reset dots navigation
          resetDotsNavigation(carousel);
          resetCarouselControls(carousel);
          setCounterItem(carousel);
          startAutoplay(carousel);
          centerItems(carousel); // center items if carousel.items.length < visibItemsNb
          alignControls(carousel);
        }, 250)
      });
    };
  
    function showPrevItems(carousel) {
      if(carousel.animating) return;
      carousel.animating = true;
      carousel.selectedItem = getIndex(carousel, carousel.selectedItem - carousel.visibItemsNb);
      animateList(carousel, '0', 'prev');
    };
  
    function showNextItems(carousel) {
      if(carousel.animating) return;
      carousel.animating = true;
      carousel.selectedItem = getIndex(carousel, carousel.selectedItem + carousel.visibItemsNb);
      animateList(carousel, carousel.translateContainer*2+'px', 'next');
    };
  
    function animateDragEnd(carousel) { // end-of-dragging animation
      carousel.element.addEventListener('dragEnd', function cb(event){
        carousel.element.removeEventListener('dragEnd', cb);
        Util.removeClass(carousel.element, 'carousel--is-dragging');
        if(event.detail.x - carousel.dragStart < -40) {
          carousel.animating = false;
          showNextItems(carousel);
        } else if(event.detail.x - carousel.dragStart > 40) {
          carousel.animating = false;
          showPrevItems(carousel);
        } else if(event.detail.x - carousel.dragStart == 0) { // this is just a click -> no dragging
          return;
        } else { // not dragged enought -> do not update carousel, just reset
          carousel.animating = true;
          animateList(carousel, carousel.translateContainer+'px', false);
        }
        carousel.dragStart = false;
      });
    };
  
    function animateList(carousel, translate, direction) { // takes care of changing visible items
      pauseAutoplay(carousel);
      Util.addClass(carousel.list, 'carousel__list--animating');
      var initTranslate = carousel.totTranslate;
      if(!carousel.options.loop) {
        translate = noLoopTranslateValue(carousel, direction);
      }
      setTranslate(carousel, 'translateX('+translate+')');
      if(transitionSupported) {
        carousel.list.addEventListener('transitionend', function cb(event){
          if(event.propertyName && event.propertyName != 'transform') return;
          Util.removeClass(carousel.list, 'carousel__list--animating');
          carousel.list.removeEventListener('transitionend', cb);
          animateListCb(carousel, direction);
        });
      } else {
        animateListCb(carousel, direction);
      }
      if(!carousel.options.loop && (initTranslate == carousel.totTranslate)) {
        // translate value was not updated -> trigger transitionend event to restart carousel
        carousel.list.dispatchEvent(new CustomEvent('transitionend'));
      }
      resetCarouselControls(carousel);
      setCounterItem(carousel);
    };
  
    function noLoopTranslateValue(carousel, direction) {
      var translate = carousel.totTranslate;
      if(direction == 'next') {
        translate = carousel.totTranslate + carousel.translateContainer;
      } else if(direction == 'prev') {
        translate = carousel.totTranslate - carousel.translateContainer;
      } else if(direction == 'click') {
        translate = carousel.selectedDotIndex*carousel.translateContainer;
      }
      if(translate > 0)  {
        translate = 0;
        carousel.selectedItem = 0;
      }
      if(translate < - carousel.translateContainer - carousel.containerWidth) {
        translate = - carousel.translateContainer - carousel.containerWidth;
        carousel.selectedItem = carousel.items.length - carousel.visibItemsNb;
      }
      if(carousel.visibItemsNb > carousel.items.length) translate = 0;
      carousel.totTranslate = translate;
      return translate + 'px';
    };
  
    function animateListCb(carousel, direction) { // reset actions after carousel has been updated
      if(direction) updateClones(carousel, direction);
      carousel.animating = false;
      // reset autoplay
      startAutoplay(carousel);
      // reset tab index
      resetItemsTabIndex(carousel);
    };
  
    function updateClones(carousel, direction) {
      if(!carousel.options.loop) return;
      // at the end of each animation, we need to update the clones before and after the visible items
      var index = (direction == 'next') ? 0 : carousel.items.length - carousel.visibItemsNb;
      // remove clones you do not need anymore
      removeClones(carousel, index, false);
      // add new clones 
      (direction == 'next') ? insertAfter(carousel, carousel.visibItemsNb, 0) : insertBefore(carousel, carousel.visibItemsNb);
      //reset transform
      setTranslate(carousel, 'translateX('+carousel.translateContainer+'px)');
    };
  
    function insertBefore(carousel, nb, delta) {
      if(!carousel.options.loop) return;
      var clones = document.createDocumentFragment();
      var start = 0;
      if(delta) start = delta;
      for(var i = start; i < nb; i++) {
        var index = getIndex(carousel, carousel.selectedItem - i - 1),
          clone = carousel.initItems[index].cloneNode(true);
        Util.addClass(clone, 'js-clone');
        clones.insertBefore(clone, clones.firstChild);
      }
      carousel.list.insertBefore(clones, carousel.list.firstChild);
      emitCarouselUpdateEvent(carousel);
    };
  
    function insertAfter(carousel, nb, init) {
      if(!carousel.options.loop) return;
      var clones = document.createDocumentFragment();
      for(var i = init; i < nb + init; i++) {
        var index = getIndex(carousel, carousel.selectedItem + carousel.visibItemsNb + i),
          clone = carousel.initItems[index].cloneNode(true);
        Util.addClass(clone, 'js-clone');
        clones.appendChild(clone);
      }
      carousel.list.appendChild(clones);
      emitCarouselUpdateEvent(carousel);
    };
  
    function removeClones(carousel, index, bool) {
      if(!carousel.options.loop) return;
      if( !bool) {
        bool = carousel.visibItemsNb;
      }
      for(var i = 0; i < bool; i++) {
        if(carousel.items[index]) carousel.list.removeChild(carousel.items[index]);
      }
    };
  
    function resetCarouselResize(carousel) { // reset carousel on resize
      var visibleItems = carousel.visibItemsNb;
      // get new items min-width value
      resetItemAutoSize(carousel);
      initCarouselLayout(carousel); 
      setItemsWidth(carousel, false);
      resetItemsWidth(carousel); // update the array of original items -> array used to create clones
      if(carousel.options.loop) {
        if(visibleItems > carousel.visibItemsNb) {
          removeClones(carousel, 0, visibleItems - carousel.visibItemsNb);
        } else if(visibleItems < carousel.visibItemsNb) {
          insertBefore(carousel, carousel.visibItemsNb, visibleItems);
        }
        updateCarouselClones(carousel); // this will take care of translate + after elements
      } else {
        // reset default translate to a multiple value of (itemWidth + margin)
        var translate = noLoopTranslateValue(carousel);
        setTranslate(carousel, 'translateX('+translate+')');
      }
      resetItemsTabIndex(carousel); // reset focusable elements
    };
  
    function resetItemAutoSize(carousel) {
      if(!cssPropertiesSupported) return;
      // remove inline style
      carousel.items[0].removeAttribute('style');
      // get original item width 
      carousel.itemAutoSize = getComputedStyle(carousel.items[0]).getPropertyValue('width');
    };
  
    function resetItemsWidth(carousel) {
      for(var i = 0; i < carousel.initItems.length; i++) {
        carousel.initItems[i].style.width = carousel.itemsWidth+"px";
      }
    };
  
    function resetItemsTabIndex(carousel) {
      var carouselActive = carousel.items.length > carousel.visibItemsNb;
      var j = carousel.items.length;
      for(var i = 0; i < carousel.items.length; i++) {
        if(carousel.options.loop) {
          if(i < carousel.visibItemsNb || i >= 2*carousel.visibItemsNb ) {
            carousel.items[i].setAttribute('tabindex', '-1');
          } else {
            if(i < j) j = i;
            carousel.items[i].removeAttribute('tabindex');
          }
        } else {
          if( (i < carousel.selectedItem || i >= carousel.selectedItem + carousel.visibItemsNb) && carouselActive) {
            carousel.items[i].setAttribute('tabindex', '-1');
          } else {
            if(i < j) j = i;
            carousel.items[i].removeAttribute('tabindex');
          }
        }
      }
      resetVisibilityOverflowItems(carousel, j);
    };
  
    function startAutoplay(carousel) {
      if(carousel.options.autoplay && !carousel.autoplayId && !carousel.autoplayPaused) {
        carousel.autoplayId = setInterval(function(){
          showNextItems(carousel);
        }, carousel.options.autoplayInterval);
      }
    };
  
    function pauseAutoplay(carousel) {
      if(carousel.options.autoplay) {
        clearInterval(carousel.autoplayId);
        carousel.autoplayId = false;
      }
    };
  
    function initAriaLive(carousel) { // create an aria-live region for SR
      if(!carousel.options.ariaLive) return;
      // create an element that will be used to announce the new visible slide to SR
      var srLiveArea = document.createElement('div');
      Util.setAttributes(srLiveArea, {'class': 'sr-only js-carousel__aria-live', 'aria-live': 'polite', 'aria-atomic': 'true'});
      carousel.element.appendChild(srLiveArea);
      carousel.ariaLive = srLiveArea;
    };
  
    function updateAriaLive(carousel) { // announce to SR which items are now visible
      if(!carousel.options.ariaLive) return;
      carousel.ariaLive.innerHTML = 'Item '+(carousel.selectedItem + 1)+' selected. '+carousel.visibItemsNb+' items of '+carousel.initItems.length+' visible';
    };
  
    function getIndex(carousel, index) {
      if(index < 0) index = getPositiveValue(index, carousel.itemsNb);
      if(index >= carousel.itemsNb) index = index % carousel.itemsNb;
      return index;
    };
  
    function getPositiveValue(value, add) {
      value = value + add;
      if(value > 0) return value;
      else return getPositiveValue(value, add);
    };
  
    function setTranslate(carousel, translate) {
      carousel.list.style.transform = translate;
      carousel.list.style.msTransform = translate;
    };
  
    function getCarouselWidth(carousel, computedWidth) { // retrieve carousel width if carousel is initially hidden
      var closestHidden = carousel.listWrapper.closest('.sr-only');
      if(closestHidden) { // carousel is inside an .sr-only (visually hidden) element
        Util.removeClass(closestHidden, 'sr-only');
        computedWidth = carousel.listWrapper.offsetWidth;
        Util.addClass(closestHidden, 'sr-only');
      } else if(isNaN(computedWidth)){
        computedWidth = getHiddenParentWidth(carousel.element, carousel);
      }
      return computedWidth;
    };
  
    function getHiddenParentWidth(element, carousel) {
      var parent = element.parentElement;
      if(parent.tagName.toLowerCase() == 'html') return 0;
      var style = window.getComputedStyle(parent);
      if(style.display == 'none' || style.visibility == 'hidden') {
        parent.setAttribute('style', 'display: block!important; visibility: visible!important;');
        var computedWidth = carousel.listWrapper.offsetWidth;
        parent.style.display = '';
        parent.style.visibility = '';
        return computedWidth;
      } else {
        return getHiddenParentWidth(parent, carousel);
      }
    };
  
    function resetCarouselControls(carousel) {
      if(carousel.options.loop) return;
      // update arrows status
      if(carousel.controls.length > 0) {
        (carousel.totTranslate == 0) 
          ? carousel.controls[0].setAttribute('disabled', true) 
          : carousel.controls[0].removeAttribute('disabled');
        (carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth) || carousel.items.length <= carousel.visibItemsNb) 
          ? carousel.controls[1].setAttribute('disabled', true) 
          : carousel.controls[1].removeAttribute('disabled');
      }
      // update carousel dots
      if(carousel.options.nav) {
        var selectedDot = carousel.navigation.getElementsByClassName(carousel.options.navigationItemClass+'--selected');
        if(selectedDot.length > 0) Util.removeClass(selectedDot[0], carousel.options.navigationItemClass+'--selected');
  
        var newSelectedIndex = getSelectedDot(carousel);
        if(carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth)) {
          newSelectedIndex = carousel.navDots.length - 1;
        }
        Util.addClass(carousel.navDots[newSelectedIndex], carousel.options.navigationItemClass+'--selected');
      }
    };
  
    function emitCarouselUpdateEvent(carousel) {
      carousel.cloneList = [];
      var clones = carousel.element.querySelectorAll('.js-clone');
      for(var i = 0; i < clones.length; i++) {
        Util.removeClass(clones[i], 'js-clone');
        carousel.cloneList.push(clones[i]);
      }
      emitCarouselEvents(carousel, 'carousel-updated', carousel.cloneList);
    };
  
    function carouselCreateNavigation(carousel) {
      if(carousel.element.getElementsByClassName('js-carousel__navigation').length > 0) return;
    
      var navigation = document.createElement('ol'),
        navChildren = '';
  
      var navClasses = carousel.options.navigationClass+' js-carousel__navigation';
      if(carousel.items.length <= carousel.visibItemsNb) {
        navClasses = navClasses + ' is-hidden';
      }
      navigation.setAttribute('class', navClasses);
  
      var dotsNr = Math.ceil(carousel.items.length/carousel.visibItemsNb),
        selectedDot = getSelectedDot(carousel),
        indexClass = carousel.options.navigationPagination ? '' : 'sr-only'
      for(var i = 0; i < dotsNr; i++) {
        var className = (i == selectedDot) ? 'class="'+carousel.options.navigationItemClass+' '+carousel.options.navigationItemClass+'--selected js-carousel__nav-item"' :  'class="'+carousel.options.navigationItemClass+' js-carousel__nav-item"';
        navChildren = navChildren + '<li '+className+'><button class="reset js-tab-focus" style="outline: none;"><span class="'+indexClass+'">'+ (i+1) + '</span></button></li>';
      }
      navigation.innerHTML = navChildren;
      carousel.element.appendChild(navigation);
    };
  
    function carouselInitNavigationEvents(carousel) {
      carousel.navigation = carousel.element.getElementsByClassName('js-carousel__navigation')[0];
      carousel.navDots = carousel.element.getElementsByClassName('js-carousel__nav-item');
      carousel.navIdEvent = carouselNavigationClick.bind(carousel);
      carousel.navigation.addEventListener('click', carousel.navIdEvent);
    };
  
    function carouselRemoveNavigation(carousel) {
      if(carousel.navigation) carousel.element.removeChild(carousel.navigation);
      if(carousel.navIdEvent) carousel.navigation.removeEventListener('click', carousel.navIdEvent);
    };
  
    function resetDotsNavigation(carousel) {
      if(!carousel.options.nav) return;
      carouselRemoveNavigation(carousel);
      carouselCreateNavigation(carousel);
      carouselInitNavigationEvents(carousel);
    };
  
    function carouselNavigationClick(event) {
      var dot = event.target.closest('.js-carousel__nav-item');
      if(!dot) return;
      if(this.animating) return;
      this.animating = true;
      var index = Util.getIndexInArray(this.navDots, dot);
      this.selectedDotIndex = index;
      this.selectedItem = index*this.visibItemsNb;
      animateList(this, false, 'click');
    };
  
    function getSelectedDot(carousel) {
      return Math.ceil(carousel.selectedItem/carousel.visibItemsNb);
    };
  
    function initCarouselCounter(carousel) {
      if(carousel.counterTor.length > 0) carousel.counterTor[0].textContent = carousel.itemsNb;
      setCounterItem(carousel);
    };
  
    function setCounterItem(carousel) {
      if(carousel.counter.length == 0) return;
      var totalItems = carousel.selectedItem + carousel.visibItemsNb;
      if(totalItems > carousel.items.length) totalItems = carousel.items.length;
      carousel.counter[0].textContent = totalItems;
    };
  
    function centerItems(carousel) {
      if(!carousel.options.justifyContent) return;
      Util.toggleClass(carousel.list, 'justify-center', carousel.items.length < carousel.visibItemsNb);
    };
  
    function alignControls(carousel) {
      if(carousel.controls.length < 1 || !carousel.options.alignControls) return;
      if(!carousel.controlsAlignEl) {
        carousel.controlsAlignEl = carousel.element.querySelector(carousel.options.alignControls);
      }
      if(!carousel.controlsAlignEl) return;
      var translate = (carousel.element.offsetHeight - carousel.controlsAlignEl.offsetHeight);
      for(var i = 0; i < carousel.controls.length; i++) {
        carousel.controls[i].style.marginBottom = translate + 'px';
      }
    };
  
    function emitCarouselEvents(carousel, eventName, eventDetail) {
      var event = new CustomEvent(eventName, {detail: eventDetail});
      carousel.element.dispatchEvent(event);
    };
  
    function resetVisibilityOverflowItems(carousel, j) {
      if(!carousel.options.overflowItems) return;
      var itemWidth = carousel.containerWidth/carousel.items.length,
        delta = (window.innerWidth - itemWidth*carousel.visibItemsNb)/2,
        overflowItems = Math.ceil(delta/itemWidth);
  
      for(var i = 0; i < overflowItems; i++) {
        var indexPrev = j - 1 - i; // prev element
        if(indexPrev >= 0 ) carousel.items[indexPrev].removeAttribute('tabindex');
        var indexNext = j + carousel.visibItemsNb + i; // next element
        if(indexNext < carousel.items.length) carousel.items[indexNext].removeAttribute('tabindex');
      }
    };
  
    Carousel.defaults = {
      element : '',
      autoplay : false,
      autoplayInterval: 5000,
      loop: true,
      nav: false,
      navigationItemClass: 'carousel__nav-item',
      navigationClass: 'carousel__navigation',
      navigationPagination: false,
      drag: false,
      justifyContent: false,
      alignControls: false,
      overflowItems: false
    };
  
    window.Carousel = Carousel;
  
    //initialize the Carousel objects
    var carousels = document.getElementsByClassName('js-carousel'),
      flexSupported = Util.cssSupports('align-items', 'stretch'),
      transitionSupported = Util.cssSupports('transition'),
      cssPropertiesSupported = ('CSS' in window && CSS.supports('color', 'var(--color-var)'));
  
    if( carousels.length > 0) {
      for( var i = 0; i < carousels.length; i++) {
        (function(i){
          var autoplay = (carousels[i].getAttribute('data-autoplay') && carousels[i].getAttribute('data-autoplay') == 'on') ? true : false,
            autoplayInterval = (carousels[i].getAttribute('data-autoplay-interval')) ? carousels[i].getAttribute('data-autoplay-interval') : 5000,
            drag = (carousels[i].getAttribute('data-drag') && carousels[i].getAttribute('data-drag') == 'on') ? true : false,
            loop = (carousels[i].getAttribute('data-loop') && carousels[i].getAttribute('data-loop') == 'off') ? false : true,
            nav = (carousels[i].getAttribute('data-navigation') && carousels[i].getAttribute('data-navigation') == 'on') ? true : false,
            navigationItemClass = carousels[i].getAttribute('data-navigation-item-class') ? carousels[i].getAttribute('data-navigation-item-class') : 'carousel__nav-item',
            navigationClass = carousels[i].getAttribute('data-navigation-class') ? carousels[i].getAttribute('data-navigation-class') : 'carousel__navigation',
            navigationPagination = (carousels[i].getAttribute('data-navigation-pagination') && carousels[i].getAttribute('data-navigation-pagination') == 'on') ? true : false,
            overflowItems = (carousels[i].getAttribute('data-overflow-items') && carousels[i].getAttribute('data-overflow-items') == 'on') ? true : false,
            alignControls = carousels[i].getAttribute('data-align-controls') ? carousels[i].getAttribute('data-align-controls') : false,
            justifyContent = (carousels[i].getAttribute('data-justify-content') && carousels[i].getAttribute('data-justify-content') == 'on') ? true : false;
          new Carousel({element: carousels[i], autoplay : autoplay, autoplayInterval : autoplayInterval, drag: drag, ariaLive: true, loop: loop, nav: nav, navigationItemClass: navigationItemClass, navigationPagination: navigationPagination, navigationClass: navigationClass, overflowItems: overflowItems, justifyContent: justifyContent, alignControls: alignControls});
        })(i);
      }
    };
  }());
// File#: _1_contact
/*
	⚠️ Make sure to include the Google Maps API. 
	You can include the script right after the contact.js (before the body closing tag in the index.html file):
	<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initGoogleMap"></script> 
*/
function initGoogleMap() {
	var contactMap = document.getElementsByClassName('js-contact__map');
	if(contactMap.length > 0) {
		for(var i = 0; i < contactMap.length; i++) {
			initContactMap(contactMap[i]);
		}
	}
};

function initContactMap(wrapper) {
	var coordinate = wrapper.getAttribute('data-coordinates').split(',');
	var map = new google.maps.Map(wrapper, {zoom: 10, center: {lat: Number(coordinate[0]), lng:  Number(coordinate[1])}});
	var marker = new google.maps.Marker({position: {lat: Number(coordinate[0]), lng:  Number(coordinate[1])}, map: map});
};
$('.responsive').slick({
    dots: true,
      prevArrow: $('.prev'),
      nextArrow: $('.next'),
    infinite: true,
    autoplay:true,
    autoplaySpeed:2000,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          autoplay:true,
          autoplaySpeed:2000,
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          autoplay:true,
          autoplaySpeed:2000,
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true
        }
      },
      {
        breakpoint: 480,
        settings: {
          autoplay:true,
          autoplaySpeed:2000,
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  });

  $('.responsive1').slick({
    dots: true,
      prevArrow: $('.prev1'),
      nextArrow: $('.next1'),
    infinite: true,
    autoplay:true,
    autoplaySpeed:2000,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          autoplay:true,
          autoplaySpeed:2000,
          slidesToShow: 4,
          slidesToScroll: 4,
          infinite: true,
          dots: false
        }
      },
      {
        breakpoint: 600,
        settings: {
          autoplay:true,
          autoplaySpeed:2000,
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: false
        }
      },
      {
        breakpoint: 480,
        settings: {
          autoplay:true,
          autoplaySpeed:2000,
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: false
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  });
(function() {
    var flexHeader = document.getElementsByClassName('js-f-header');
    if(flexHeader.length > 0) {
      var menuTrigger = flexHeader[0].getElementsByClassName('js-anim-menu-btn')[0],
        firstFocusableElement = getMenuFirstFocusable();
  
      // we'll use these to store the node that needs to receive focus when the mobile menu is closed 
      var focusMenu = false;
  
      menuTrigger.addEventListener('anim-menu-btn-clicked', function(event){
        toggleMenuNavigation(event.detail);
      });
  
      // listen for key events
      window.addEventListener('keyup', function(event){
        // listen for esc key
        if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
          // close navigation on mobile if open
          if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
            focusMenu = menuTrigger; // move focus to menu trigger when menu is close
            menuTrigger.click();
          }
        }
        // listen for tab key
        if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
          // close navigation on mobile if open when nav loses focus
          if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-f-header')) menuTrigger.click();
        }
      });
  
      // listen for resize
      var resizingId = false;
      window.addEventListener('resize', function() {
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 500);
      });
  
      function getMenuFirstFocusable() {
        var focusableEle = flexHeader[0].getElementsByClassName('f-header__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
          firstFocusable = false;
        for(var i = 0; i < focusableEle.length; i++) {
          if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
            firstFocusable = focusableEle[i];
            break;
          }
        }
  
        return firstFocusable;
      };
      
      function isVisible(element) {
        return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
      };
  
      function doneResizing() {
        if( !isVisible(menuTrigger) && Util.hasClass(flexHeader[0], 'f-header--expanded')) {
          menuTrigger.click();
        }
      };
      
      function toggleMenuNavigation(bool) { // toggle menu visibility on small devices
        Util.toggleClass(document.getElementsByClassName('f-header__nav')[0], 'f-header__nav--is-visible', bool);
        Util.toggleClass(flexHeader[0], 'f-header--expanded', bool);
        menuTrigger.setAttribute('aria-expanded', bool);
        if(bool) firstFocusableElement.focus(); // move focus to first focusable element
        else if(focusMenu) {
          focusMenu.focus();
          focusMenu = false;
        }
      };
    }
  }());
// File#: _1_main-header
(function() {
	var mainHeader = document.getElementsByClassName('js-main-header')[0];
	if( mainHeader ) {
		var trigger = mainHeader.getElementsByClassName('js-main-header__nav-trigger')[0],
			nav = mainHeader.getElementsByClassName('js-main-header__nav')[0];
		//detect click on nav trigger
		trigger.addEventListener("click", function(event) {
			event.preventDefault();
			var ariaExpanded = !Util.hasClass(nav, 'main-header__nav--is-visible');
			//show nav and update button aria value
			Util.toggleClass(nav, 'main-header__nav--is-visible', ariaExpanded);
			trigger.setAttribute('aria-expanded', ariaExpanded);
			if(ariaExpanded) { //opening menu -> move focus to first element inside nav
				nav.querySelectorAll('[href], input:not([disabled]), button:not([disabled])')[0].focus();
			}
		});
	}
}());
// File#: _1_reading-progressbar
(function() {
	var readingIndicator = document.getElementsByClassName('js-reading-progressbar')[0],
		readingIndicatorContent = document.getElementsByClassName('js-reading-content')[0];
	
	if( readingIndicator && readingIndicatorContent) {
		var progressInfo = [],
			progressEvent = false,
			progressFallback = readingIndicator.getElementsByClassName('js-reading-progressbar__fallback')[0],
			progressIsSupported = 'value' in readingIndicator;

		progressInfo['height'] = readingIndicatorContent.offsetHeight;
		progressInfo['top'] = readingIndicatorContent.getBoundingClientRect().top;
		progressInfo['window'] = window.innerHeight;
		progressInfo['class'] = 'reading-progressbar--is-active';
		
		//init indicator
		setProgressIndicator();
		//listen to the window scroll event - update progress
		window.addEventListener('scroll', function(event){
			if(progressEvent) return;
			progressEvent = true;
			(!window.requestAnimationFrame) ? setTimeout(function(){setProgressIndicator();}, 250) : window.requestAnimationFrame(setProgressIndicator);
		});
		// listen to window resize - update progress
		window.addEventListener('resize', function(event){
			if(progressEvent) return;
			progressEvent = true;
			(!window.requestAnimationFrame) ? setTimeout(function(){resetProgressIndicator();}, 250) : window.requestAnimationFrame(resetProgressIndicator);
		});

		function setProgressIndicator() {
			progressInfo['top'] = readingIndicatorContent.getBoundingClientRect().top;
			if(progressInfo['height'] <= progressInfo['window']) {
				// short content - hide progress indicator
				Util.removeClass(readingIndicator, progressInfo['class']);
				progressEvent = false;
				return;
			}
			// get new progress and update element
			Util.addClass(readingIndicator, progressInfo['class']);
			var value = (progressInfo['top'] >= 0) ? 0 : 100*(0 - progressInfo['top'])/(progressInfo['height'] - progressInfo['window']);
			readingIndicator.setAttribute('value', value);
			if(!progressIsSupported && progressFallback) progressFallback.style.width = value+'%';
			progressEvent = false;
		};

		function resetProgressIndicator() {
			progressInfo['height'] = readingIndicatorContent.offsetHeight;
			progressInfo['window'] = window.innerHeight;
			setProgressIndicator();
		};
	}
}());
// File#: _1_sticky-hero
(function() {
	var StickyBackground = function(element) {
		this.element = element;
		this.scrollingElement = this.element.getElementsByClassName('sticky-hero__content')[0];
		this.nextElement = this.element.nextElementSibling;
		this.scrollingTreshold = 0;
		this.nextTreshold = 0;
		initStickyEffect(this);
	};

	function initStickyEffect(element) {
		var observer = new IntersectionObserver(stickyCallback.bind(element), { threshold: [0, 0.1, 1] });
		observer.observe(element.scrollingElement);
		if(element.nextElement) observer.observe(element.nextElement);
	};

	function stickyCallback(entries, observer) {
		var threshold = entries[0].intersectionRatio.toFixed(1);
		(entries[0].target ==  this.scrollingElement)
			? this.scrollingTreshold = threshold
			: this.nextTreshold = threshold;

		Util.toggleClass(this.element, 'sticky-hero--media-is-fixed', (this.nextTreshold > 0 || this.scrollingTreshold > 0));
	};


	var stickyBackground = document.getElementsByClassName('js-sticky-hero'),
		intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype);
	if(stickyBackground.length > 0 && intersectionObserverSupported) { // if IntersectionObserver is not supported, animations won't be triggeres
		for(var i = 0; i < stickyBackground.length; i++) {
			(function(i){ // if animations are enabled -> init the StickyBackground object
        if( Util.hasClass(stickyBackground[i], 'sticky-hero--overlay-layer') || Util.hasClass(stickyBackground[i], 'sticky-hero--scale')) new StickyBackground(stickyBackground[i]);
      })(i);
		}
	}
}());
(function() {
    var SwipeContent = function(element) {
      this.element = element;
      this.delta = [false, false];
      this.dragging = false;
      this.intervalId = false;
      initSwipeContent(this);
    };
  
    function initSwipeContent(content) {
      content.element.addEventListener('mousedown', handleEvent.bind(content));
      content.element.addEventListener('touchstart', handleEvent.bind(content));
    };
  
    function initDragging(content) {
      //add event listeners
      content.element.addEventListener('mousemove', handleEvent.bind(content));
      content.element.addEventListener('touchmove', handleEvent.bind(content));
      content.element.addEventListener('mouseup', handleEvent.bind(content));
      content.element.addEventListener('mouseleave', handleEvent.bind(content));
      content.element.addEventListener('touchend', handleEvent.bind(content));
    };
  
    function cancelDragging(content) {
      //remove event listeners
      if(content.intervalId) {
        (!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
        content.intervalId = false;
      }
      content.element.removeEventListener('mousemove', handleEvent.bind(content));
      content.element.removeEventListener('touchmove', handleEvent.bind(content));
      content.element.removeEventListener('mouseup', handleEvent.bind(content));
      content.element.removeEventListener('mouseleave', handleEvent.bind(content));
      content.element.removeEventListener('touchend', handleEvent.bind(content));
    };
  
    function handleEvent(event) {
      switch(event.type) {
        case 'mousedown':
        case 'touchstart':
          startDrag(this, event);
          break;
        case 'mousemove':
        case 'touchmove':
          drag(this, event);
          break;
        case 'mouseup':
        case 'mouseleave':
        case 'touchend':
          endDrag(this, event);
          break;
      }
    };
  
    function startDrag(content, event) {
      content.dragging = true;
      // listen to drag movements
      initDragging(content);
      content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
      // emit drag start event
      emitSwipeEvents(content, 'dragStart', content.delta, event.target);
    };
  
    function endDrag(content, event) {
      cancelDragging(content);
      // credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
      var dx = parseInt(unify(event).clientX), 
        dy = parseInt(unify(event).clientY);
      
      // check if there was a left/right swipe
      if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
        var s = getSign(dx - content.delta[0]);
        
        if(Math.abs(dx - content.delta[0]) > 30) {
          (s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);	
        }
        
        content.delta[0] = false;
      }
      // check if there was a top/bottom swipe
      if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
          var y = getSign(dy - content.delta[1]);
  
          if(Math.abs(dy - content.delta[1]) > 30) {
            (y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
        }
  
        content.delta[1] = false;
      }
      // emit drag end event
      emitSwipeEvents(content, 'dragEnd', [dx, dy]);
      content.dragging = false;
    };
  
    function drag(content, event) {
      if(!content.dragging) return;
      // emit dragging event with coordinates
      (!window.requestAnimationFrame) 
        ? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250) 
        : content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
    };
  
    function emitDrag(event) {
      emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
    };
  
    function unify(event) { 
      // unify mouse and touch events
      return event.changedTouches ? event.changedTouches[0] : event; 
    };
  
    function emitSwipeEvents(content, eventName, detail, el) {
      var trigger = false;
      if(el) trigger = el;
      // emit event with coordinates
      var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
      content.element.dispatchEvent(event);
    };
  
    function getSign(x) {
      if(!Math.sign) {
        return ((x > 0) - (x < 0)) || +x;
      } else {
        return Math.sign(x);
      }
    };
  
    window.SwipeContent = SwipeContent;
    
    //initialize the SwipeContent objects
    var swipe = document.getElementsByClassName('js-swipe-content');
    if( swipe.length > 0 ) {
      for( var i = 0; i < swipe.length; i++) {
        (function(i){new SwipeContent(swipe[i]);})(i);
      }
    }
  }());
(function() {
    var Tab = function(element) {
      this.element = element;
      this.tabList = this.element.getElementsByClassName('js-tabs__controls')[0];
      this.listItems = this.tabList.getElementsByTagName('li');
      this.triggers = this.tabList.getElementsByTagName('a');
      this.panelsList = this.element.getElementsByClassName('js-tabs__panels')[0];
      this.panels = Util.getChildrenByClassName(this.panelsList, 'js-tabs__panel');
      this.hideClass = 'is-hidden';
      this.customShowClass = this.element.getAttribute('data-show-panel-class') ? this.element.getAttribute('data-show-panel-class') : false;
      this.layout = this.element.getAttribute('data-tabs-layout') ? this.element.getAttribute('data-tabs-layout') : 'horizontal';
      this.initTab();
    };
  
    Tab.prototype.initTab = function() {
      //set initial aria attributes
      this.tabList.setAttribute('role', 'tablist');
      for( var i = 0; i < this.triggers.length; i++) {
        var bool = (i == 0),
          panelId = this.panels[i].getAttribute('id');
        this.listItems[i].setAttribute('role', 'presentation');
        Util.setAttributes(this.triggers[i], {'role': 'tab', 'aria-selected': bool, 'aria-controls': panelId, 'id': 'tab-'+panelId});
        Util.addClass(this.triggers[i], 'js-tabs__trigger'); 
        Util.setAttributes(this.panels[i], {'role': 'tabpanel', 'aria-labelledby': 'tab-'+panelId});
        Util.toggleClass(this.panels[i], this.hideClass, !bool);
  
        if(!bool) this.triggers[i].setAttribute('tabindex', '-1'); 
      }
  
      //listen for Tab events
      this.initTabEvents();
    };
  
    Tab.prototype.initTabEvents = function() {
      var self = this;
      //click on a new tab -> select content
      this.tabList.addEventListener('click', function(event) {
        if( event.target.closest('.js-tabs__trigger') ) self.triggerTab(event.target.closest('.js-tabs__trigger'), event);
      });
      //arrow keys to navigate through tabs 
      this.tabList.addEventListener('keydown', function(event) {
        ;
        if( !event.target.closest('.js-tabs__trigger') ) return;
        if( tabNavigateNext(event, self.layout) ) {
          event.preventDefault();
          self.selectNewTab('next');
        } else if( tabNavigatePrev(event, self.layout) ) {
          event.preventDefault();
          self.selectNewTab('prev');
        }
      });
    };
  
    Tab.prototype.selectNewTab = function(direction) {
      var selectedTab = this.tabList.querySelector('[aria-selected="true"]'),
        index = Util.getIndexInArray(this.triggers, selectedTab);
      index = (direction == 'next') ? index + 1 : index - 1;
      //make sure index is in the correct interval 
      //-> from last element go to first using the right arrow, from first element go to last using the left arrow
      if(index < 0) index = this.listItems.length - 1;
      if(index >= this.listItems.length) index = 0;	
      this.triggerTab(this.triggers[index]);
      this.triggers[index].focus();
    };
  
    Tab.prototype.triggerTab = function(tabTrigger, event) {
      var self = this;
      event && event.preventDefault();	
      var index = Util.getIndexInArray(this.triggers, tabTrigger);
      //no need to do anything if tab was already selected
      if(this.triggers[index].getAttribute('aria-selected') == 'true') return;
      
      for( var i = 0; i < this.triggers.length; i++) {
        var bool = (i == index);
        Util.toggleClass(this.panels[i], this.hideClass, !bool);
        if(this.customShowClass) Util.toggleClass(this.panels[i], this.customShowClass, bool);
        this.triggers[i].setAttribute('aria-selected', bool);
        bool ? this.triggers[i].setAttribute('tabindex', '0') : this.triggers[i].setAttribute('tabindex', '-1');
      }
    };
  
    function tabNavigateNext(event, layout) {
      if(layout == 'horizontal' && (event.keyCode && event.keyCode == 39 || event.key && event.key == 'ArrowRight')) {return true;}
      else if(layout == 'vertical' && (event.keyCode && event.keyCode == 40 || event.key && event.key == 'ArrowDown')) {return true;}
      else {return false;}
    };
  
    function tabNavigatePrev(event, layout) {
      if(layout == 'horizontal' && (event.keyCode && event.keyCode == 37 || event.key && event.key == 'ArrowLeft')) {return true;}
      else if(layout == 'vertical' && (event.keyCode && event.keyCode == 38 || event.key && event.key == 'ArrowUp')) {return true;}
      else {return false;}
    };
    
    //initialize the Tab objects
    var tabs = document.getElementsByClassName('js-tabs');
    if( tabs.length > 0 ) {
      for( var i = 0; i < tabs.length; i++) {
        (function(i){new Tab(tabs[i]);})(i);
      }
    }
  }());
// File#: _2_pricing-table
(function() {
	// NOTE: you need the js code only when using the --has-switch variation of the pricing table
	// default version does not require js
	var pTable = document.getElementsByClassName('js-p-table--has-switch');
	if(pTable.length > 0) {
		for(var i = 0; i < pTable.length; i++) {
			(function(i){ addPTableEvent(pTable[i]);})(i);
		}

		function addPTableEvent(element) {
			var pSwitch = element.getElementsByClassName('js-p-table__switch')[0];
			if(pSwitch) {
				pSwitch.addEventListener('change', function(event) {
          Util.toggleClass(element, 'p-table--yearly', (event.target.value == 'yearly'));
				});
			}
		}
	}
}());