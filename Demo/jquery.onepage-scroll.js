(function() {
  jQuery(function() {
    $.fn.swipeEvents = function() {
      return this.each(function() {
        startX;
        startY;
        var $this, touchmove, touchstart;
        $this = $(this);
        $this.bind('touchstart', touchstart);
        touchstart = function(e) {
          var startX, startY, touches;
          touches = e.originalEvent.touches;
          if (touches && touches.length) {
            startX = touches[0].pageX;
            startY = touches[0].pageY;
            return $this.bind('touchmove', touchmove);
          }
        };
        return touchmove = function(e) {
          var deltaX, deltaY, touches;
          touches = e.originalEvent.touches;
          if (touches && touches.length) {
            deltaX = startX - touches[0].pageX;
            deltaY = startY - touches[0].pageY;
            if (deltaX >= 50) {
              $this.trigger("swipeLeft");
            }
            if (deltaX <= -50) {
              $this.trigger("sipeRight");
            }
            if (deltaY >= 50) {
              $this.trigger("swipeUp");
            }
            if (deltaY <= -50) {
              $this.trigger("swipeDown");
            }
            if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
              return $this.unbind('touchmove', touchmove);
            }
          }
        };
      });
    };
    $.onepage_scroll = function(element, options) {
      var state;
      state = '';
      this.settings = {};
      this.$element = $(element);
      this.setState = function(_state) {
        return state = _state;
      };
      this.getState = function() {
        return state;
      };
      this.transformPage = function(index) {
        var pos;
        pos = ((index - 1) * 100) * -1;
        if (!this.supportTransition) {
          return this.$element.animate({
            top: "" + pos + "%"
          }, function() {
            return this.settings.afterMove(index);
          });
        } else {
          this.$element.css({
            "transform": "translate3d(0, " + pos + "%, 0)",
            "transition": "all " + this.settings.animationTime + "ms " + this.settings.easing,
            "-webkit-transform": "translate3d(0, " + pos + "%, 0)",
            "-webkit-transition": "all " + this.settings.animationTime + "ms " + this.settings.easing
          });
          return this.$element.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
            return this.settings.afterMove(index);
          });
        }
      };
      this.moveDown = function() {
        var index;
        index = $("" + this.settings.sectionContainer + ".active").data("index");
        return this.moveTo(index + 1);
      };
      this.moveUp = function() {
        var index;
        index = $("" + this.settings.sectionContainer + ".active").data("index");
        return this.moveTo(index - 1);
      };
      this.moveTo = function(page_index) {
        var current, next;
        current = $("" + this.settings.sectionContainer + ".active");
        if (page_index < 1 || page_index > this.total) {
          if (this.settings.loop) {
            page_index = page_index < 1 ? this.total : 1;
          } else {
            return;
          }
        }
        next = $("" + this.settings.sectionContainer + "[data-index='" + page_index + "']");
        this.settings.beforeMove(current.data("index"));
        current.removeClass("active");
        next.addClass("active");
        if (this.settings.pagination) {
          $(".onepage-pagination li a.active").removeClass("active");
          $(".onpeage-pagination li a[data-index='" + page_index + "']").addClass("active");
        }
        $("body").removeClass(("viewing-page-" + (current.data("index"))).addClass("viewing-page-" + (next.data("index"))));
        if (this.settings.updateURL) {
          this.updateHistory(page_index);
        }
        return this.transformPage(page_index);
      };
      this.updateHistory = function(index) {
        var href;
        if (history.replaceState) {
          href = window.location.href.substr(0, "" + (window.location.href.indexOf('#')) + "#" + index);
          return history.pushState({}, document.title, href);
        }
      };
      this.responsive = function() {
        if ($(window).width() < this.settings.responsiveFallback) {
          $("body").addClass("disabled-onepage-scroll");
          $(document).unbind("mousewheel DOMMouseScroll");
          return this.$element.swipeEvents().unbind("swipeDown swipeUp");
        } else {
          if ($("body").hasClass("disabled-onepage-scroll")) {
            $("body").removeClass("disabled-onepage-scroll");
            $("html, body, .wrapper").animate({
              scrollTop: 0
            }, "fast");
          }
          this.$element.swipeEvents().bind("swipeDown", function(e) {
            if ($("body").hasClass("disabled-onepage-scroll")) {
              return;
            }
            e.preventDefault();
            return this.moveUp();
          }).bind("swipeUp", function(e) {
            if ($("body").hasClass("disabled-onepage-scroll")) {
              return;
            }
            e.preventDefault();
            return this.moveDown();
          });
          return $(document).bind('mousewheel DOMMouseScroll', function(e) {
            var delta;
            e.preventDefault();
            delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
            return this.init_scroll(e, delta);
          });
        }
      };
      this.init_scroll = function(e, delta) {
        var deltaOfInterest, timeNow;
        deltaOfInterest = delta;
        timeNow = new Date().getTime();
        if (timeNow - this.lastAnimation < this.quietPeriod + this.settings.animationTime) {
          e.preventDefault();
          return;
        }
        if (deltaOfInterest < 0) {
          this.moveDown();
        } else {
          this.moveUp();
        }
        return this.lastAnimation = timeNow;
      };
      this.bindPagination = function() {
        var _this = this;
        return $(".onepage-pagination li a").on('click', function(e) {
          var page_index;
          page_index = $(e.currentTarget).data("index");
          return _this.moveTo(page_index);
        });
      };
      this.supportTransition = function() {
        return document.body.style.transition !== void 0 || document.body.style.webkitTransition !== void 0;
      };
      this.init = function() {
        var init_index, posTop,
          _this = this;
        this.settings = $.extend({}, this.defaults, options);
        this.sections = $(this.settings.sectionContainer);
        this.total = this.sections.length;
        this.topPos = 0;
        this.lastAnimation = 0;
        this.quietPeriod = 500;
        this.paginationList = "";
        this.$element.addClass("onepage-wrapper".css("position", "relative"));
        $.each(sections, function(i) {
          $(this).css({
            position: "absolute",
            top: "" + topPos + "%"
          });
          if (this.settings.paginationList) {
            return this.paginationList += "<li><a data-index='" + (i + 1) + "' href='" + (i + 1) + "'></a></li>";
          }
        });
        this.$element.swipeEvents().bind("swipeDown", function(e) {
          if ($("body").hasClass("disabled-onepage-scroll")) {
            return;
          }
          e.preventDefault();
          return this.moveUp(this.$element);
        }).bind("swipeUp", function(e) {
          if ($("body").hasClass("disabled-onepage-scroll")) {
            return;
          }
          e.preventDefault();
          return this.moveDown(this.$element);
        });
        $(document).bind('mousewheel DOMMouseScroll', function(e) {
          var delta;
          e.preventDefault();
          delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
          if (!$("body").hasClass("disabled-onepage-scroll")) {
            return this.init_scroll();
          }
        });
        if (this.settings.pagination) {
          $("<ul class='onepage-pagination'>" + this.paginationList + "</ul>").prependTo("body");
          posTop = (this.$element.find(".onepage-pagination").height() / 2) * -1;
          this.$element.find(".onepage-pagination").css("margin-top", posTop);
        }
        $("" + this.settings.sectionContainer + "[data-index='1']").addClass("active");
        $("body").addClass("viewing-page-1");
        if (this.settings.pagination) {
          $(".onepage-pagination li a[data-index='1']").addClass("active");
        }
        if (window.location.hash !== "" && window.location.hash !== "#1") {
          init_index = window.location.hash.replace("#", "");
          this.moveTo(init_index);
        }
        if (this.settings.pagination) {
          this.bindPagination();
        }
        if (this.settings.responsiveFallback !== false) {
          $(window).resize(function() {
            return this.responsive();
          });
          this.responsive();
        }
        if (this.settings.keyboard) {
          $(document).keydown(function(e) {
            var tag;
            tag = e.target.nodeName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || $("body").hasClass("disabled-onepage-scroll")) {
              return;
            }
            switch (e.which) {
              case 33:
              case 38:
                _this.moveUp();
                break;
              case 34:
              case 40:
                _this.moveDown();
                break;
              case 36:
                _this.moveTo(1);
                break;
              case 35:
                _this.moveTo(_this.total);
                break;
              default:
                return;
            }
            return e.preventDefault();
          });
        }
        return this;
      };
      this.init();
      return this;
    };
    $.onepage_scroll.prototype.defaults = {
      sectionContainer: "section",
      easing: "ease",
      animationTime: 1000,
      pagination: true,
      keyboard: false,
      updateURL: false,
      beforeMove: $.noop,
      afterMove: $.noop,
      loop: false,
      responsiveFallback: false
    };
    return $.fn.onepage_scroll = function(options) {
      return this.each(function() {
        var plugin;
        if ($(this).data('onepage_scroll') === void 0) {
          plugin = new $.onepage_scroll(this, options);
          return $(this).data('onepage_scroll', plugin);
        } else {
          return $(this).data('onepage_scroll');
        }
      });
    };
  });

}).call(this);

/*
//@ sourceMappingURL=jquery.onepage-scroll.js.map
*/