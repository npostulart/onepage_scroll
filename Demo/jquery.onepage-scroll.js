/*
Name    : jQuery Onepage Scroll
Author  : Niklas Postulart, @niklaspostulart
Version : 1.1.8
Repo    : https://github.com/npostulart/onepage-scroll
Website : http://niklaspostulart.de
*/


(function() {
  "use strict";
  var wrap;

  wrap = function($) {
    var isInt;
    isInt = function(n) {
      return n !== "" && !isNaN(n) && Math.round(n) === n;
    };
    $.fn.stripClass = function(partialMatch, endOrBegin) {
      var x;
      x = new RegExp((!endOrBegin ? "\\b" : "\\S+") + partialMatch + "\\S*", "g");
      this.attr("class", function(i, c) {
        if (!c) {
          return;
        }
        return c.replace(x, "");
      });
      return this;
    };
    $.onepage_scroll = function(element, options) {
      var supportTransform, supportTransition;
      this.settings = {};
      this.$element = $(element);
      this.state = "";
      this.eventState = "";
      this.quietPeriod = 500;
      supportTransition = function() {
        var thisBody, thisStyle;
        thisBody = document.body || document.documentElement;
        thisStyle = thisBody.style;
        return thisStyle.transitions !== void 0 || thisStyle.WebkitTransition !== void 0;
      };
      supportTransform = function() {
        var prefix, prefixes, prop, support, thisBody, thisStyle, _i, _len;
        prefixes = "Webkit Moz O ms".split(" ");
        prop = "transform";
        thisBody = document.body || document.documentElement;
        thisStyle = thisBody.style;
        support = thisStyle[prop] !== void 0;
        if (!support) {
          prop = prop.charAt(0).toUpperCase() + prop.slice(1);
          for (_i = 0, _len = prefixes.length; _i < _len; _i++) {
            prefix = prefixes[_i];
            if (thisStyle[prefix + prop] !== void 0) {
              return true;
            }
          }
        }
        return support;
      };
      this.transformPage = function(index, callback) {
        var pos, self,
          _this = this;
        callback = typeof callback !== "function" ? $.noop : callback;
        pos = ((index - 1) * 100) * -1;
        if (!this.supportTransition || !this.supportTransform) {
          this.$element.animate({
            top: "" + pos + "%"
          }, function() {
            _this.settings.afterMove(index);
            return callback(index);
          });
        } else {
          this.$element.css({
            "-ms-transform": "translate(0, " + pos + "%)",
            "-ms-transition": "all " + this.settings.animationTime + "ms " + this.settings.easing,
            "-webkit-transform": "translate(0, " + pos + "%)",
            "-webkit-transition": "all " + this.settings.animationTime + "ms " + this.settings.easing,
            "transform": "translate(0, " + pos + "%)",
            "transition": "all " + this.settings.animationTime + "ms " + this.settings.easing
          });
          self = this;
          this.$element.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function(e) {
            if (e.target === this) {
              self.settings.afterMove(index);
              return callback(index);
            }
          });
        }
        return this;
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
        var current, current_index, index, next, target,
          _this = this;
        current = $("" + this.settings.sectionContainer + ".active");
        current_index = current.data("index");
        if (!isInt(page_index)) {
          target = this.$element.find(page_index);
          if (target.length !== 1) {
            return;
          }
          page_index = target.data("index");
          if (!isInt(page_index)) {
            return;
          }
        }
        if (page_index === current_index) {
          return;
        }
        index = page_index;
        if (this.settings.smooth && Math.abs(current_index - page_index) > 1) {
          index = page_index > current_index ? current_index + 1 : current_index - 1;
        }
        if (index < 1 || index > this.total) {
          if (this.settings.loop) {
            index = index < 1 ? this.total : 1;
          } else {
            return;
          }
        }
        next = $("" + this.settings.sectionContainer + "[data-index='" + index + "']");
        this.settings.beforeMove(current.data("index"));
        current.removeClass("active");
        next.addClass("active");
        if (this.settings.pagination) {
          $(".onepage-pagination li a.active").removeClass("active");
          $(".onepage-pagination li a[data-index='" + index + "']").addClass("active");
        }
        $("body").removeClass("viewing-page-" + (current.data("index"))).addClass("viewing-page-" + (next.data("index")));
        if (this.settings.updateURL) {
          this.updateHistory(index);
        }
        if (this.settings.smooth && page_index !== index) {
          this.transformPage(index, function() {
            return _this.moveTo(page_index);
          });
        } else {
          this.transformPage(index);
        }
        return this;
      };
      this.updateHistory = function(index) {
        var href;
        if (history.replaceState) {
          href = window.location.href.substr(0, "" + (window.location.href.indexOf("#")) + "#" + index);
          history.pushState({}, document.title, href);
        }
        return this;
      };
      this.bindEvents = function() {
        if (this.eventState === "binded" || this.state !== "created") {
          return;
        }
        this.bindScrollEvents();
        this.bindSwipeEvents();
        if (this.settings.keyboard) {
          this.bindKeyEvents();
        }
        this.eventState = "binded";
        return this;
      };
      this.unbindEvents = function() {
        if (this.eventState !== "binded") {
          return;
        }
        this.unbindScrollEvents();
        this.unbindSwipeEvents();
        if (this.settings.keyboard) {
          this.unbindKeyEvents();
        }
        this.eventState = "unbinded";
        return this;
      };
      this.bindScrollEvents = function() {
        var _this = this;
        $(document).bind("mousewheel.onepage DOMMouseScroll.onepage", function(e) {
          var delta;
          e.preventDefault();
          delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
          return _this.init_scroll(e, delta);
        });
        return this;
      };
      this.unbindScrollEvents = function() {
        $(document).unbind("mousewheel.onepage DOMMouseScroll.onepage");
        return this;
      };
      this.bindSwipeEvents = function() {
        var hammer,
          _this = this;
        hammer = this.$element.hammer();
        this.$element.hammer().on("swipedown.onepage", function(e) {
          e.preventDefault();
          e.gesture.preventDefault();
          return _this.moveUp();
        }).on("swipeup.onepage", function(e) {
          e.preventDefault();
          e.gesture.preventDefault();
          return _this.moveDown();
        });
        $(document).bind('touchmove.onepage', function(e) {
          e.preventDefault();
          return false;
        });
        return this;
      };
      this.unbindSwipeEvents = function() {
        var hammer;
        hammer = this.$element.hammer();
        hammer.off("swipedown.onepage");
        hammer.off("swipeup.onepage");
        $(document).unbind('touchmove.onepage');
        return this;
      };
      this.bindKeyEvents = function() {
        var _this = this;
        $(document).on("keydown.onepage", function(e) {
          var tag;
          tag = e.target.nodeName;
          if (tag === "INPUT" || tag === "TEXTAREA") {
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
        return this;
      };
      this.unbindKeyEvents = function() {
        $(document).off("keydown.onepage");
        return this;
      };
      this.viewportTooSmall = function() {
        if (this.settings.responsiveFallbackWidth !== false && $(window).width() < this.settings.responsiveFallbackWidth) {
          return true;
        }
        if (this.settings.responsiveFallbackHeight !== false && $(window).height() < this.settings.responsiveFallbackHeight) {
          return true;
        }
        return false;
      };
      this.watchResponsive = function() {
        if (this.viewportTooSmall()) {
          if (this.state === "created") {
            this.destroy();
          }
        } else {
          if (this.state !== "created") {
            this.create();
          }
        }
        return this;
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
        this.lastAnimation = timeNow;
        return this;
      };
      this.bindPagination = function() {
        var _this = this;
        $(".onepage-pagination").on("click.onepage", "li a", function(e) {
          var page_index;
          page_index = $(e.currentTarget).data("index");
          return _this.moveTo(page_index);
        });
        return this;
      };
      this.createSections = function() {
        var topPos,
          _this = this;
        topPos = 0;
        $.each(this.sections, function(i, elem) {
          $(elem).addClass("section").attr("data-index", i + 1).css({
            position: "absolute",
            top: "" + topPos + "%"
          });
          topPos += 100;
          if (_this.settings.pagination) {
            return _this.paginationList += "<li><a data-index='" + (i + 1) + "' href='#" + (i + 1) + "'></a></li>";
          }
        });
        return this;
      };
      this.destroySections = function() {
        this.sections.removeClass("section active").removeAttr("data-index style");
        return this;
      };
      this.destroy = function() {
        if (this.state === "created") {
          this.settings.beforeDestroy(this);
          $("html, body").removeClass("onepage-scroll-enabled");
          $("body").stripClass("viewing-page-");
          this.$element.removeClass("onepage-wrapper").removeAttr("style");
          this.destroySections();
          if (this.settings.pagination) {
            $("ul.onepage-pagination").off("click.onepage", "li a");
            $("ul.onepage-pagination").remove();
          }
          this.unbindEvents();
          this.state = "destroyed";
          this.settings.afterDestroy(this);
        }
        return this;
      };
      this.create = function() {
        var init_index, posTop;
        if (this.state !== "created") {
          if (this.viewportTooSmall()) {
            return;
          }
          this.settings.beforeCreate(this);
          this.sections = $(this.settings.sectionContainer);
          this.total = this.sections.length;
          this.lastAnimation = 0;
          this.paginationList = "";
          $("html, body").addClass("onepage-scroll-enabled");
          this.$element.addClass("onepage-wrapper").css("position", "relative");
          this.createSections();
          if (this.settings.pagination) {
            $("<ul class='onepage-pagination'>" + this.paginationList + "</ul>").prependTo("body");
            posTop = ($(".onepage-pagination").height() / 2) * -1;
            $(".onepage-pagination").css("margin-top", posTop);
            this.bindPagination();
          }
          this.reset();
          if (this.settings.updateURL && window.location.hash !== "" && window.location.hash !== "#1") {
            init_index = window.location.hash.replace("#", "");
            this.moveTo(init_index);
          }
          this.state = "created";
          this.bindEvents();
          this.settings.afterCreate(this);
        }
        return this;
      };
      this.reset = function() {
        $("" + this.settings.sectionContainer + "[data-index='1']").addClass("active");
        $("body").addClass("viewing-page-1");
        if (this.settings.pagination) {
          $(".onepage-pagination li a[data-index='1']").addClass("active");
        }
        return $(window).scrollTop(0);
      };
      this.init = function() {
        var _this = this;
        this.settings = $.extend({}, this.defaults, options);
        this.supportTransition = supportTransition();
        this.supportTransform = supportTransform();
        if (this.settings.responsiveFallbackWidth !== false || this.settings.responsiveFallbackHeight !== false) {
          $(window).on("resize.onepage", function() {
            return _this.watchResponsive();
          });
        }
        this.create();
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
      responsiveFallbackWidth: false,
      responsiveFallbackHeight: false,
      smooth: false,
      beforeCreate: $.noop,
      afterCreate: $.noop,
      beforeDestroy: $.noop,
      afterDestroy: $.noop
    };
    $.fn.onepage_scroll = function(options) {
      this.each(function() {
        var plugin;
        if ($(this).data("onepage_scroll") === void 0) {
          plugin = new $.onepage_scroll(this, options);
          return $(this).data("onepage_scroll", plugin);
        }
      });
      if (this.length === 1 && $(this).data("onepage_scroll") !== void 0) {
        return $(this).data("onepage_scroll");
      }
    };
    return $.fn.onepage_scroll;
  };

  if (typeof define === "function" && define.amd) {
    define(["jquery"], wrap);
  } else {
    wrap(jQuery);
  }

}).call(this);
