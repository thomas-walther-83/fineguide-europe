import { ScrollView, StyleSheet, View } from 'react-native';

import { FilterPill } from '@/components/FilterPill';
import { SectionHeader } from '@/components/SectionHeader';
import { layout, space } from '@/lib/theme';

export type SelectorOption = {
  /** Stable identity for the option. */
  id: string;
  /** Visible pill label. */
  label: string;
  /** Optional leading element (e.g. a FlagChip). */
  leading?: React.ReactNode;
};

type Props = {
  /** Uppercase section label shown above the pill row. */
  label: string;
  options: SelectorOption[];
  selectedId: string;
  onSelect: (id: string) => void;
};

/**
 * The single selector pattern used on Compare / Trip / Calc: one uppercase
 * `SectionHeader` label over a horizontally-scrolling row of `FilterPill`s.
 *
 * The row is full-bleed — pills scroll edge-to-edge — while the first/last pill
 * still line up with the screen inset (`layout.screenX`). Drop it inside a
 * ScrollView padded by `layout.screenX` and it renders consistently everywhere.
 */
export function Selector({ label, options, selectedId, onSelect }: Props) {
  return (
    <View style={styles.block}>
      <SectionHeader title={label} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.row}
        contentContainerStyle={styles.content}
      >
        {options.map((opt) => (
          <FilterPill
            key={opt.id}
            label={opt.label}
            active={opt.id === selectedId}
            onPress={() => onSelect(opt.id)}
            leading={opt.leading}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: layout.gap },
  // Break out of the screen inset so pills can scroll edge-to-edge…
  row: { flexGrow: 0, marginHorizontal: -layout.screenX },
  // …then re-apply it so the first/last pill align with surrounding content.
  content: { paddingHorizontal: layout.screenX, paddingRight: space[2] },
});
