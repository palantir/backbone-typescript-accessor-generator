<% models.forEach(function(model){ %>

class _<%= model.name %> extends Backbone.Model {
  <% model.members.forEach(function(member){ %>

    public get_<%=member.name%>() : <%=member.type%> { return this.get('<%=member.name%>'); }

    <% if (!member.readonly) { %>
    public set_<%=member.name%>(val : <%=member.type%>) : void { this.set('<%=member.name%>', val); }
    <% } %>

  <% }); %>

  static fromJSON(json) : <%= model.name %> {
    var attributes = {};
    <% model.members.forEach(function(member){ %>
      if ("<%= member.name %>" in json) {
        <% if (_.contains(primitives, member.type)) { %>
          attributes["<%= member.name %>"] = json["<%= member.name %>"];
        <% } else { %>
          attributes["<%= member.name %>"] = <%= member.type %>.fromJSON(json["<%= member.name %>"]);
        <% } %>
      }
      <% if (!member.optional) { %>
      else {
        throw "JSON failed validation";
      }
      <% } %>
    <% }); %>
    return new <%= model.name %>(attributes);
  }
}
<% }); %>
