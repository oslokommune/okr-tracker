import { forceManyBody, forceCenter, forceLink, forceCollide } from 'd3';

export default {
  center() {
    const width = this.svg.node().parentNode.clientWidth;

    return forceCenter()
      .x(width / 2)
      .y(this.height / 2);
  },

  collide() {
    return forceCollide()
      .radius(this.radius * 2)
      .strength(0.5);
  },

  link() {
    return forceLink()
      .links(this.links)
      .id(d => d.id);
  },

  charge() {
    return forceManyBody().strength(-500).distanceMin(2);
  },
};
