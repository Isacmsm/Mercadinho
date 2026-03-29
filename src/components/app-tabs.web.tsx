import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, useWindowDimensions, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';

const MOBILE_BREAKPOINT = 600;

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Loja</TabButton>
          </TabTrigger>
          <TabTrigger name="vendedor" href={'/vendedor' as never} asChild>
            <TabButton>Gerenciar</TabButton>
          </TabTrigger>
          <TabTrigger name="carrinho" href={'/carrinho' as never} asChild>
            <TabButton>Carrinho</TabButton>
          </TabTrigger>
          <TabTrigger name="perfil" href={'/perfil' as never} asChild>
            <TabButton>Perfil</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        isMobile && styles.tabButtonFlexMobile,
        pressed && styles.pressed,
      ]}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={[styles.tabButtonView, isMobile && styles.tabButtonViewMobile]}>
        <ThemedText
          type="small"
          themeColor={isFocused ? 'text' : 'textSecondary'}
          style={isMobile && styles.labelMobile}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;

  return (
    <View
      {...props}
      style={styles.tabListContainer}>
      <ThemedView
        type="backgroundElement"
        style={[
          styles.innerContainer,
          isMobile ? styles.innerContainerMobile : styles.innerContainerDesktop,
        ]}>
        {!isMobile && (
          <ThemedText type="smallBold" style={styles.brandText}>
            Mercadinho Esquina
          </ThemedText>
        )}

        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  innerContainer: {
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  innerContainerDesktop: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
    maxWidth: 800,
    alignSelf: 'center',
  },
  innerContainerMobile: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    justifyContent: 'space-around',
  },
  brandText: {
    marginRight: 'auto',
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  tabButtonFlexMobile: {
    flex: 1,
  },
  tabButtonViewMobile: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelMobile: {
    fontSize: 11,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
