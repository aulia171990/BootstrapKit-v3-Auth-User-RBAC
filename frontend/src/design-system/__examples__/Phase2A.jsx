import React from 'react';
import { Plus, Trash2, Settings } from 'lucide-react';
import {
  Button, IconButton, Label, Link, Card, CardHeader, CardContent, CardFooter,
  Avatar, Badge, Chip, Divider, Separator, Container, Stack, Flex, Grid, Box,
  Surface, Paper, Spinner, Skeleton, Box,
} from '../index.js';

/**
 * Phase 2A — usage examples (Storybook-style reference without the Storybook dep).
 * Each export is a small renderable example. Use these as the visual contract.
 */
export const ButtonExamples = (
  <Stack gap={3}>
    <Flex gap={2} wrap>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="link">Link</Button>
    </Flex>
    <Flex gap={2} align="center">
      <Button size="xs">xs</Button>
      <Button size="sm">sm</Button>
      <Button size="md">md</Button>
      <Button size="lg">lg</Button>
      <Button size="xl">xl</Button>
    </Flex>
    <Flex gap={2} align="center">
      <Button leftIcon={Plus}>Left</Button>
      <Button rightIcon={Settings}>Right</Button>
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
      <Button fullWidth>Full width</Button>
    </Flex>
  </Stack>
);

export const IconButtonExample = (
  <Flex gap={2}>
    <IconButton icon={Plus} aria-label="Add" />
    <IconButton icon={Trash2} aria-label="Delete" variant="destructive" />
    <IconButton icon={Settings} aria-label="Settings" variant="outline" size="lg" />
  </Flex>
);

export const TypographyExamples = (
  <Stack gap={2}>
    <Label htmlFor="ex" required>Email address</Label>
    <Link href="#">Primary link</Link>
    <Link href="#" tone="muted" underline="always">Muted link</Link>
  </Stack>
);

export const CardExamples = (
  <Stack gap={4}>
    <Card hover onClick={() => {}}>
      <CardHeader title="Order #1024" subtitle="Pending" actions={<Badge tone="warning" dot>Pending</Badge>} />
      <CardContent>Customer: Budi Santoso</CardContent>
      <CardFooter><Button size="sm">View</Button></CardFooter>
    </Card>
    <Card loading>
      <CardContent>Loading state…</CardContent>
    </Card>
  </Stack>
);

export const AvatarExamples = (
  <Flex gap={3} align="center">
    <Avatar name="Budi Santoso" />
    <Avatar name="Siti" status="online" />
    <Avatar name="A" status="busy" badge={<Badge tone="danger">3</Badge>} />
    <Avatar src="https://invalid.example/x.png" name="Broken" status="away" />
  </Flex>
);

export const BadgeExamples = (
  <Flex gap={2}>
    <Badge tone="success" dot>Success</Badge>
    <Badge tone="warning" dot>Warning</Badge>
    <Badge tone="danger" dot>Danger</Badge>
    <Badge tone="info" dot>Info</Badge>
    <Badge tone="neutral">Neutral</Badge>
  </Flex>
);

export const SurfaceExamples = (
  <Stack gap={3}>
    <Surface p={4} bordered radius="md">Bare surface</Surface>
    <Paper p={4}>Elevated paper</Paper>
    <Box p={4} bg="var(--ds-color-surface-2)" radius="md">Box</Box>
  </Stack>
);

export const LayoutExamples = (
  <Container>
    <Grid columns={3} gap={3}>
      <Surface p={3}>A</Surface>
      <Surface p={3}>B</Surface>
      <Surface p={3}>C</Surface>
    </Grid>
    <Divider label="section" />
    <Separator />
    <Flex gap={2}><Spinner /><Skeleton variant="text" lines={2} /></Flex>
  </Container>
);

export default {
  ButtonExamples, IconButtonExample, TypographyExamples, CardExamples,
  AvatarExamples, BadgeExamples, SurfaceExamples, LayoutExamples,
};
