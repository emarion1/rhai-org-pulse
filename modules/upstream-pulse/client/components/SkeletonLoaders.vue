<script>
import { h } from 'vue'

function skeleton(classes = '') {
  return h('div', { class: `animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${classes}` })
}

export const StatCardSkeleton = {
  name: 'StatCardSkeleton',
  render() {
    return h('div', { class: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5' }, [
      h('div', { class: 'flex items-center gap-3 mb-3' }, [
        skeleton('h-8 w-8 rounded-lg'),
        skeleton('h-3.5 w-24'),
      ]),
      skeleton('h-7 w-20 mb-1'),
      skeleton('h-3 w-16'),
    ])
  }
}

export const ContributionCardSkeleton = {
  name: 'ContributionCardSkeleton',
  render() {
    return h('div', { class: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5' }, [
      h('div', { class: 'flex items-center gap-3 mb-3' }, [
        skeleton('h-8 w-8 rounded-lg'),
        skeleton('h-4 w-20'),
      ]),
      skeleton('h-7 w-16 mb-2'),
      h('div', { class: 'flex items-center justify-between mb-2.5' }, [
        skeleton('h-3 w-24'),
        skeleton('h-5 w-12 rounded-full'),
      ]),
      skeleton('h-2 w-full rounded-full'),
    ])
  }
}

export const OrgCardSkeleton = {
  name: 'OrgCardSkeleton',
  render() {
    return h('div', { class: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5' }, [
      h('div', { class: 'flex items-start justify-between mb-3' }, [
        skeleton('h-5 w-32'),
        skeleton('h-5 w-24 rounded-full'),
      ]),
      h('div', { class: 'flex items-baseline gap-2 mb-0.5' }, [
        skeleton('h-8 w-20'),
        skeleton('h-5 w-16 rounded-full'),
      ]),
      skeleton('h-3 w-28 mb-3'),
      h('div', { class: 'mb-4' }, [
        h('div', { class: 'flex justify-between mb-1.5' }, [
          skeleton('h-3 w-16'),
          skeleton('h-3 w-10'),
        ]),
        skeleton('h-1.5 w-full rounded-full'),
      ]),
      h('div', { class: 'flex items-center gap-4' }, [
        skeleton('h-3.5 w-16'),
        skeleton('h-3.5 w-20'),
        skeleton('h-3.5 w-20'),
      ]),
    ])
  }
}

export const ProjectCardSkeleton = {
  name: 'ProjectCardSkeleton',
  render() {
    return h('div', { class: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5' }, [
      h('div', { class: 'flex items-start justify-between mb-4' }, [
        h('div', {}, [
          skeleton('h-5 w-36 mb-1.5'),
          skeleton('h-3 w-24'),
        ]),
        skeleton('h-4 w-10'),
      ]),
      h('div', { class: 'flex items-baseline gap-2 mb-3' }, [
        skeleton('h-7 w-16'),
        skeleton('h-3.5 w-28'),
      ]),
      h('div', { class: 'mb-4' }, [
        h('div', { class: 'flex justify-between mb-1' }, [
          skeleton('h-3 w-16'),
          skeleton('h-3 w-10'),
        ]),
        skeleton('h-1.5 w-full rounded-full'),
      ]),
      h('div', { class: 'grid grid-cols-4 gap-2' }, [
        h('div', { class: 'text-center' }, [skeleton('h-7 w-7 rounded-md mx-auto mb-1'), skeleton('h-3.5 w-6 mx-auto mb-0.5'), skeleton('h-2.5 w-10 mx-auto')]),
        h('div', { class: 'text-center' }, [skeleton('h-7 w-7 rounded-md mx-auto mb-1'), skeleton('h-3.5 w-6 mx-auto mb-0.5'), skeleton('h-2.5 w-10 mx-auto')]),
        h('div', { class: 'text-center' }, [skeleton('h-7 w-7 rounded-md mx-auto mb-1'), skeleton('h-3.5 w-6 mx-auto mb-0.5'), skeleton('h-2.5 w-10 mx-auto')]),
        h('div', { class: 'text-center' }, [skeleton('h-7 w-7 rounded-md mx-auto mb-1'), skeleton('h-3.5 w-6 mx-auto mb-0.5'), skeleton('h-2.5 w-10 mx-auto')]),
      ]),
    ])
  }
}

export const ContributorRowSkeleton = {
  name: 'ContributorRowSkeleton',
  render() {
    return h('div', { class: 'flex items-center gap-4 py-3 border-b border-gray-50 dark:border-gray-700/30 last:border-0' }, [
      skeleton('h-4 w-6'),
      skeleton('h-10 w-10 rounded-full shrink-0'),
      h('div', { class: 'flex-1 min-w-0' }, [
        skeleton('h-4 w-32 mb-1'),
        skeleton('h-3 w-20'),
      ]),
      h('div', { class: 'text-right shrink-0' }, [
        skeleton('h-5 w-12 mb-1'),
        skeleton('h-3 w-16'),
      ]),
    ])
  }
}

export const LeadershipCardSkeleton = {
  name: 'LeadershipCardSkeleton',
  render() {
    return h('div', { class: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-5' }, [
      h('div', { class: 'flex items-center gap-3 mb-3' }, [
        skeleton('h-8 w-8 rounded-lg'),
        skeleton('h-4 w-20'),
      ]),
      h('div', { class: 'flex items-center justify-between mb-2' }, [
        h('div', { class: 'flex items-baseline gap-1.5' }, [
          skeleton('h-7 w-8'),
          skeleton('h-3.5 w-12'),
        ]),
        skeleton('h-5 w-14 rounded-full'),
      ]),
      skeleton('h-2 w-full rounded-full'),
    ])
  }
}

export const ChartSkeleton = {
  name: 'ChartSkeleton',
  props: {
    height: { type: String, default: 'h-64' },
  },
  render() {
    return h('div', { class: 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-6' }, [
      h('div', { class: 'flex items-center justify-between mb-4' }, [
        skeleton('h-5 w-36'),
        skeleton('h-4 w-20'),
      ]),
      skeleton(`${this.height} w-full rounded-lg`),
    ])
  }
}

export const TableRowSkeleton = {
  name: 'TableRowSkeleton',
  props: {
    cols: { type: Number, default: 4 },
  },
  render() {
    return h('tr', {},
      Array.from({ length: this.cols }, (_, i) =>
        h('td', { class: 'px-6 py-4' }, [
          skeleton(`h-4 ${i === 0 ? 'w-40' : i === this.cols - 1 ? 'w-12 ml-auto' : 'w-24'}`),
        ])
      )
    )
  }
}
</script>
