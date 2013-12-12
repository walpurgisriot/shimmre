// Generated by CoffeeScript 1.6.3
(function() {
  var Compile, alt, andP, atom, cRule, cat, charopt, cheat, code, drop, exp0, exp1, exp2, exp3, mainPRule, map, match, notP, notp, nth, optP, pRule, paren, peg, pluck, plus, repP, rule, ruleInit, s, sepBy, string, subPRule, t, tag, term, _, __, _ref, _ref1,
    __slice = [].slice;

  match = function(v, r) {
    return {
      val: v,
      rem: r
    };
  };

  peg = {
    term: function(t) {
      return function(str) {
        return str.substr(0, t.length) === t && match([t], str.slice(t.length));
      };
    },
    cat: function(p1, p2) {
      return function(str) {
        var t1, t2;
        return (t1 = p1(str)) && (t2 = p2(t1.rem)) && match(t1.val.concat(t2.val), t2.rem);
      };
    },
    alt: function(p1, p2) {
      return function(str) {
        return p1(str) || p2(str);
      };
    },
    opt: function(p) {
      return function(str) {
        return p(str) || match([], str);
      };
    },
    rep: function(p) {
      return function(s) {
        var r;
        return (r = p(s)) && map(peg.rep(p), function(a) {
          return r.val.concat(a);
        })(r.rem) || match([], s);
      };
    },
    andp: function(p) {
      return function(str) {
        return p(str) && match([], str);
      };
    },
    notp: function(p) {
      return function(str) {
        return !p(str) && match([], str);
      };
    }
  };

  string = peg.term;

  cat = function() {
    var ms;
    ms = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return ms.reduce(peg.cat);
  };

  alt = function() {
    var ms;
    ms = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return ms.reduce(peg.alt);
  };

  notp = function(p1, p2) {
    return peg.cat(peg.notp(p1), p2);
  };

  sepBy = function(p, sep) {
    return cat(p, peg.rep(cat(map(sep, function() {
      return [];
    }), p)));
  };

  cheat = function(re) {
    return function(s) {
      var r;
      return (r = s.match(re)) && match([r[0]], s.slice(r[0].length));
    };
  };

  map = function() {
    var fn, mfns;
    fn = arguments[0], mfns = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return function(str) {
      var r;
      return (r = fn(str)) && match(mfns.reduce((function(d, f) {
        return f(d);
      }), r.val), r.rem);
    };
  };

  tag = function(t) {
    return function(d) {
      return [
        {
          tag: t,
          data: d
        }
      ];
    };
  };

  nth = function() {
    var ns;
    ns = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return function(v) {
      var n, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = ns.length; _i < _len; _i++) {
        n = ns[_i];
        _results.push(v[n]);
      }
      return _results;
    };
  };

  pluck = function(v) {
    return v[0];
  };

  _ = cheat(/^(\s|;.*)*/);

  __ = cheat(/^(\s|;.*)+/);

  atom = map(cheat(/^[a-zA-Z_][a-zA-Z0-9_'-]*/), pluck, tag('atom'));

  term = map(cheat(/^("(\\"|[^"])*"|'(\\'|[^'])*')/), pluck, (function(n) {
    return n.slice(1, -1);
  }), tag('term'));

  exp0 = function(s) {
    return alt(notp(ruleInit, atom), term, charopt, paren)(s);
  };

  ruleInit = alt(cat(peg.opt(cat(string("main"), __)), atom, _, string('<-')), cat(atom, _, string('->')));

  _ref = (function() {
    var _i, _len, _ref, _ref1, _results;
    _ref = [['*', 'rep'], ['?', 'opt'], ['+', 'plus']];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref1 = _ref[_i], s = _ref1[0], t = _ref1[1];
      _results.push(map(cat(exp0, _, string(s)), nth(0), pluck, tag(t)));
    }
    return _results;
  })(), repP = _ref[0], optP = _ref[1], plus = _ref[2];

  exp1 = alt(repP, optP, plus, exp0);

  _ref1 = (function() {
    var _i, _len, _ref1, _ref2, _results;
    _ref1 = [['!', 'not'], ['&', 'and'], ['-', 'drop']];
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      _ref2 = _ref1[_i], s = _ref2[0], t = _ref2[1];
      _results.push(map(cat(string(s), _, exp1), nth(2), pluck, tag(t)));
    }
    return _results;
  })(), notP = _ref1[0], andP = _ref1[1], drop = _ref1[2];

  exp2 = map(sepBy(alt(notP, andP, drop, exp1), __), tag('cat'));

  exp3 = function(s) {
    return map(sepBy(exp2, cat(_, string('|'), _)), tag('alt'))(s);
  };

  paren = map(cat(string('('), _, exp3, _, string(')')), nth(2));

  charopt = map(cheat(/^\[(\\]|[^\]])*\]/), pluck, tag('charopt'));

  subPRule = map(cat(atom, _, string('<-'), _, exp3), nth(0, 4), tag('parse'));

  mainPRule = map(cat(string("main"), __, subPRule), nth(2), pluck, tag('main'));

  pRule = alt(mainPRule, subPRule);

  code = map(cheat(/^(.|\n(?=\s))*/), tag('code'));

  cRule = map(cat(atom, _, string('->'), _, code), nth(0, 4), tag('compile'));

  rule = alt(pRule, cRule);

  exports.parse = map(cat(map(_, function() {
    return [];
  }), sepBy(rule, _), map(_, function() {
    return [];
  })), tag('document'), pluck);

  Compile = (function() {
    function Compile() {
      this.rules = {};
      this.context = {};
    }

    Compile.prototype._compile = function(d) {
      if (!(d.tag in this)) {
        throw new TypeError("Don't know how to compile " + d.tag);
      }
      return this[d.tag](d.data);
    };

    Compile.prototype.document = function(rs) {
      var e, m, r, unresolved, _i, _len;
      for (_i = 0, _len = rs.length; _i < _len; _i++) {
        r = rs[_i];
        this._compile(r);
      }
      unresolved = [];
      for (r in this.rules) {
        try {
          this.rules[r]('');
        } catch (_error) {
          e = _error;
          if (e instanceof TypeError && (m = e.message.match(/method '([^']+)/))) {
            unresolved.push(m[1]);
          } else {
            throw e;
          }
        }
      }
      if (unresolved.length !== 0) {
        throw new ReferenceError("Can't resolve parsing expressions: " + (unresolved.join(', ')));
      }
    };

    Compile.prototype.main = function(r) {
      var _rs;
      this._compile(r);
      _rs = this.rules;
      return this.output = function(s) {
        return _rs[r.data[0].data](s);
      };
    };

    Compile.prototype.parse = function(r) {
      return this.rules[r[0].data] = this._compile(r[1]);
    };

    Compile.prototype.compile = function(r) {
      var _atm, _code, _ctx, _rule, _tfn, _transform;
      _atm = r[0], _code = r[1];
      if (!(_rule = this.rules[_atm.data])) {
        throw new Error("Compile rule `" + _atm.data + "' defined before parse rule");
      }
      _tfn = eval("(function ($) {" + _code.data + "})");
      _ctx = this.context;
      _transform = function(argv) {
        var x;
        x = _tfn.call(_ctx, argv);
        if (x != null) {
          return Array.isArray(x) && x || [x];
        } else {
          return [];
        }
      };
      return this.rules[_atm.data] = map(_rule, _transform);
    };

    Compile.prototype.plus = function(r) {
      return this.cat([
        r, {
          tag: 'rep',
          data: r
        }
      ]);
    };

    Compile.prototype.cat = function(rs) {
      return cat.apply(this, rs.map(this._compile, this));
    };

    Compile.prototype.alt = function(rs) {
      return alt.apply(this, rs.map(this._compile, this));
    };

    Compile.prototype.term = peg.term;

    Compile.prototype.rep = function(r) {
      return peg.rep(this._compile(r));
    };

    Compile.prototype.opt = function(r) {
      return peg.opt(this._compile(r));
    };

    Compile.prototype.charopt = function(c) {
      return cheat(RegExp("^" + c));
    };

    Compile.prototype.atom = function(a) {
      var _rs;
      _rs = this.rules;
      return function(s) {
        return _rs[a](s);
      };
    };

    Compile.prototype.not = function(n) {
      return peg.notp(this._compile(n));
    };

    Compile.prototype.and = function(n) {
      return peg.andp(this._compile(n));
    };

    Compile.prototype.drop = function(n) {
      return map(this._compile(n), function() {
        return [];
      });
    };

    return Compile;

  })();

  exports.compile = map(exports.parse, function(pt) {
    var c;
    (c = new Compile())._compile(pt);
    return [c.output];
  });

}).call(this);
