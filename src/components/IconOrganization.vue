<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    viewBox="0 0 25 24"
    fill="none"
  >
    <g clip-path="url(#clip0_546_2978)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M20.6504 21.645V0.64502H8.65039V4.39502H1.90039V21.645H0.400391V23.145H22.9004V21.645H20.6504ZM8.65039 21.645H6.40039V17.145H8.65039V21.645ZM11.6504 21.645H10.1504V15.645H4.90039V21.645H3.40039V5.89502H11.6504V21.645ZM19.1504 21.645H13.1504V20.145H17.6504V18.645H13.1504V17.145H17.6504V15.645H13.1504V14.145H17.6504V12.645H13.1504V11.145H17.6504V9.64502H13.1504V8.14502H17.6504V6.64502H13.1504V5.14502H17.6504V3.64502H11.6504V4.39502H10.1504V2.14502H19.1504V21.645Z"
        :fill="fill"
      />
      <path
        d="M4.90039 11.7975H6.40039V13.4025H4.90039V11.7975ZM8.65039 11.7975H10.1504V13.4025H8.65039V11.7975ZM4.90039 8.04002H6.40039V9.64502H4.90039V8.04002ZM8.65039 8.04002H10.1504V9.64502H8.65039V8.04002Z"
        :fill="fill"
      />
    </g>
    <defs>
      <clipPath id="clip0_546_2978">
        <rect width="24" height="24" fill="white" transform="translate(0.400391)" />
      </clipPath>
    </defs>
  </svg>
</template>

<script>
export default {
  name: 'IconOrganization',

  props: {
    width: {
      type: Number,
      required: false,
      default: 25,
    },
    height: {
      type: Number,
      required: false,
      default: 24,
    },
    fill: {
      type: String,
      required: false,
      default: 'var(--color-primary)',
    },
  },
};
</script>
