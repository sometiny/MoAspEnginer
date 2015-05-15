var newCatalog = function() {
	return F.activex("ADOX.Catalog");
};
var newTable = function(name) {
	return F.activex("ADOX.Table", function(n, catlog) {
		this.ParentCatalog = catlog;
		this.Name = n;
	}, name, this);
};
var newColumn = function(name) {
	return F.activex("ADOX.Column", function(n, catlog) {
		if (catlog) this.ParentCatalog = catlog;
		this.Name = n;
	}, name, this);
};
var newGroup = function(name) {
	return F.activex("ADOX.Group", function(n, catlog) {
		this.ParentCatalog = catlog;
		this.Name = n;
	}, name, this);
};
var newUser = function(name) {
	return F.activex("ADOX.User", function(n, catlog) {
		this.ParentCatalog = catlog;
		this.Name = n;
	}, name, this);
};
var newIndex = function(name) {
	return F.activex("ADOX.Index", function(n) {
		this.Name = n;
	}, name);
};
var newKey = function(name) {
	return F.activex("ADOX.Key", function(n) {
		this.Name = n;
	}, name);
};
var newView = function(name, command) {
	return F.activex("ADOX.View", function(n, c) {
		this.Name = n;
		this.Command = c;
	}, name, command);
};
var newProcedure = function(name, command) {
	return F.activex("ADOX.Procedure", function(n, c) {
		this.Name = n;
		this.Command = c;
	}, name, command);
};

var _table = function(obj) {
	var __table = obj,
		_columns = null,
		_keys = null,
		_indexes = null;
	var _set = function(col, datatype, options) {
		if (datatype) col.Type = datatype;
		if (options) {
			if (options.hasOwnProperty("size")) col.DefinedSize = options.size;
			if (options.hasOwnProperty("scale")) col.NumericScale = options.scale;
			if (options.hasOwnProperty("precision")) col.Precision = options.precision;
			if (options.hasOwnProperty("autoincrement")) col.Properties("Autoincrement").Value = options.autoincrement;
			if (options.hasOwnProperty("def")) col.Properties("Default").Value = options.def;
			if (options.hasOwnProperty("description")) col.Properties("Description").Value = options.description;
			if (options.hasOwnProperty("nullable")) col.Properties("Nullable").Value = options.nullable;
			if (options.hasOwnProperty("fixed")) col.Properties("Fixed Length").Value = options.fixed;
			if (options.hasOwnProperty("seed")) col.Properties("Seed").Value = options.seed;
			if (options.hasOwnProperty("increment")) col.Properties("Increment").Value = options.increment;
		}
	};
	var table = {};
	table.columns = function(name) {
		if (_columns == null) {
			_columns = {};
			var __Columns = __table.Columns, count=__Columns.Count;
			for (var i = 0; i < count; i++) {
				_columns[__Columns[i].Name] = __Columns[i];
			}
		}
		if (_columns.hasOwnProperty(name)) return _columns[name];
		return null;
	};
	table.columns.remove = function(name) {
		var col = table.columns(name);
		if (col == null) {
			ExceptionManager.put(0x80012345, "table.columns.remove", "column '" + name + "' is not exists;");
			return null;
		}
		__table.Columns.Delete(name);
		delete _columns[name];
	};
	table.columns.update = function(name, datatype, options) {
		var col = table.columns(name);
		if (col == null) {
			ExceptionManager.put(0x80012346, "table.columns.update", "column '" + name + "' is not exists;");
			return null;
		}
		_set(col, datatype, options);
		return col;
	};
	table.columns.create = function(name, datatype, options) {
		var _col = table.columns(name);
		if (_col != null) {
			ExceptionManager.put(0x80012347, "table.columns.create", "column '" + name + "' is exists;");
			return null;
		}
		var col = newColumn.call(__table.ParentCatalog, name);
		_set(col, datatype, options);
		__table.Columns.Append(col);
		_columns[name] = col;
		return col;
	};
	table.keys = function(name) {
		if (_keys == null) {
			_keys = {};
			for (var i = 0; i < __table.Keys.Count; i++) {
				_keys[__table.Keys[i].Name] = __table.Keys[i];
			}
		}
		if (_keys.hasOwnProperty(name)) return _keys[name];
		return null;
	};
	table.keys.remove = function(name) {
		var key = table.keys(name);
		if (key == null) {
			ExceptionManager.put(0x80012348, "table.keys.remove", "key '" + name + "' is not exists;");
			return null;
		}
		__table.Keys.Delete(name);
		delete _keys[name];
	};
	table.keys.create = function(name, column, type, foreigntable, foreigncolunm) {
		var key = table.keys(name);
		if (key != null) {
			ExceptionManager.put(0x80012349, "table.keys.create", "key '" + name + "' is exists;");
			return null;
		}
		var key = newKey(name);
		key.Type = type || 1;
		var columns = column.split(",");
		for (var i = 0; i < columns.length; i++) {
			key.Columns.Append(columns[i]);
		}
		if (type == 2 && foreigntable && foreigncolunm) {
			index.RelatedTable = foreigntable;
			key.Columns[columns[0]].RelatedColumn = foreigncolunm;
		}
		_keys[name] = key;
		__table.Keys.Append(key);
		return key;
	};
	table.indexes = function(name) {
		if (_indexes == null) {
			_indexes = {};
			for (var i = 0; i < __table.Indexes.Count; i++) {
				_indexes[__table.Indexes[i].Name] = __table.Indexes[i];
			}
		}
		if (_indexes.hasOwnProperty(name)) return _indexes[name];
		return null;
	};
	table.indexes.remove = function(name) {
		var index = table.indexes(name);
		if (index == null) {
			ExceptionManager.put(0x80012350, "table.indexes.remove", "index '" + name + "' is not exists;");
			return null;
		}
		__table.Indexes.Delete(name);
		delete _indexes[name];
	};
	table.indexes.create = function(name, column) {
		var index = table.indexes(name);
		if (index != null) {
			ExceptionManager.put(0x80012351, "table.indexes.create", "index '" + name + "' is exists;");
			return null;
		}
		var index = newIndex(name);
		var columns = column.split(",");
		for (var i = 0; i < columns.length; i++) {
			index.Columns.Append(columns[i]);
		}
		_indexes[name] = index;
		__table.Indexes.Append(index);
		return index;
	};
	return table;
};
var adox = function() {
	var catlog = newCatalog();
	var activeconnection = null;
	var tables = {},
		users = {},
		views = {},
		groups = {},
		procedures = {},
		owners = [];
	var _parsename = function(name) {
		var indexd = name.indexOf("."),
			owner = "";
		if (indexd > 0) {
			owner = name.substr(0, indexd);
			name = name.substr(indexd + 1);
			owners.push({
				"name": name,
				"type": 1,
				"owner": owner
			});
		}
		return {
			"name": name,
			"owner": owner
		};
	}
	var instance = {
		errors: ""
	};
	instance.isok = function() {
		return activeconnection != null;
	};
	instance.create = function(connstring) {
		try {
			activeconnection = F.activex("ADODB.CONNECTION",
				function(str) {
					try {
						catlog.Create(str);
					} catch (ex) {
						if ((ex.number & 0xffff) == 0xE17) {
							this.open(str);
							catlog.ActiveConnection = this;
						} else {
							ExceptionManager.put(ex, "adox.create");
							return null;
						}
					}
				},
				connstring);
			return true;
		} catch (ex) {
			ExceptionManager.put(ex, "adox.create");
			return false;
		}
	};
	instance.load = function(conn) {
		if (typeof conn == "string") {
			try {
				activeconnection = F.activex("ADODB.CONNECTION",
					function(str) {
						this.open(str);
						catlog.ActiveConnection = this;
					},
					conn);
			} catch (ex) {
				ExceptionManager.put(ex, "adox.create");
				return false;
			}
		} else {
			activeconnection = conn;
		}
		return true;
	};
	instance.dump = function() {
		var _adox = {};
		for (var i = 0; i < catlog.Tables.Count; i++) {
			var table = catlog.Tables(i);
			if (table.Name.slice(0, 3) != "Mo_") continue;
			var tb = _adox[table.Name] = {};
			tb.Properties = {};
			for (var p = 0; p < table.Properties.Count; p++) {
				try {
					tb.Properties[table.Properties(i).Name] = "";
				} catch (ex) {}
			}
			tb.Columns = {};
			for (var p = 0; p < table.Columns.Count; p++) {
				var col = table.Columns(p);
				var co = tb.Columns[col.Name] = {
					Type: col.Type,
					DefinedSize: col.DefinedSize,
					NumericScale: col.NumericScale,
					Precision: col.Precision,
					Properties: {},
					Attributes: col.Attributes
				};
				try {
					co.SortOrder = col.SortOrder;
				} catch (ex) {}
				for (var j = 0; j < col.Properties.Count; j++) {
					co.Properties[col.Properties(j).Name] = "";
				}
			}
		}
		F.echo("<pre>");
		F.echo(JSON.stringify(_adox, null, "  "));
		F.echo("</pre>");
	};

	instance.views = {};
	instance.views.create = function(name, command) {
		var parsed = _parsename(name);
		if (parsed.owner != "") {
			name = parsed.name;
			owners.push({
				"name": name,
				"type": 5,
				"owner": parsed.owner
			});
		}
		views[name] = newView(name, command);
	};

	instance.procedures = {};
	instance.procedures.create = function(name, command) {
		var parsed = _parsename(name);
		if (parsed.owner != "") {
			name = parsed.name;
			owners.push({
				"name": name,
				"type": 4,
				"owner": parsed.owner
			});
		}
		procedures[name] = newProcedure(name, command);
	};

	instance.tables = function(name) {
		for (var i = 0; i < catlog.Tables.Count; i++) {
			var _t = catlog.Tables(i);
			if (_t.Name == name) return _table(_t);
		}
		return null;
	};
	instance.tables.remove = function(name) {
		catlog.Tables.Delete(name);
	};
	instance.tables.create = function(name) {
		if (typeof name == "string") {
			var parsed = _parsename(name);
			if (parsed.owner != "") {
				name = parsed.name;
				owners.push({
					"name": name,
					"type": 1,
					"owner": parsed.owner
				});
			}
			tables[name] = newTable.call(catlog, name);
			return _table(tables[name]);
		} else {
			for (var i in name) {
				if (!name.hasOwnProperty(i)) continue;
				var table = instance.tables.create(i);
				var cols = name[i].columns;
				if (cols) {
					for (var col in cols) {
						if (!cols.hasOwnProperty(col)) continue;
						table.columns.create(col, cols[col].type, cols[col].options);
					}
				}
				var indexes = name[i].indexes;
				if (indexes) {
					for (var index in indexes) {
						if (!indexes.hasOwnProperty(index)) continue;
						table.indexes.create(index, indexes[index]);
					}
				}
				var keys = name[i].keys;
				if (keys) {
					for (var key in keys) {
						if (!keys.hasOkeyswnProperty(key)) continue;
						table.keys.create(key, keys[key]);
					}
				}
			}
		}
	};

	instance.save = function() {
		try {
			for (var i in tables) {
				if (!tables.hasOwnProperty(i)) continue;
				catlog.Tables.Append(tables[i]);
			}
			for (var i in groups) {
				if (!groups.hasOwnProperty(i)) continue;
				catlog.Groups.Append(groups[i]);
			}
			for (var i in views) {
				if (!views.hasOwnProperty(i)) continue;
				catlog.Views.Append(views[i]);
			}
			for (var i in procedures) {
				if (!procedures.hasOwnProperty(i)) continue;
				catlog.Procedures.Append(procedures[i]);
			}
			for (var i in users) {
				if (!users.hasOwnProperty(i)) continue;
				catlog.Users.Append(users[i]);
			}
			for (var i = 0; i < owners.length; i++) {
				var owner = owners[i];
				catlog.SetObjectOwner(owner.name, owner.type, owner.owner);
			}
			return true;
		} catch (ex) {
			ExceptionManager.put(ex, "adox.save");
			return false;
		}
	};
	return instance;
};

module.exports = adox;