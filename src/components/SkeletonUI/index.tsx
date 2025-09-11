import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "~/hooks/useTheme";
import Skeleton from "../Skeleton";

interface SkeletonUIProps {
  type?: "message" | "profile" | "card" | "post" | "header" | "list";
  count?: number;
  style?: any;
  inverted?: boolean;
}

/**
 * SkeletonUI provides pre-built skeleton templates for common UI patterns
 */
const SkeletonUI: React.FC<SkeletonUIProps> = ({
  type = "message",
  count = 1,
  style,
  inverted = false,
}) => {
  const theme = useTheme();

  const renderContent = () => {
    switch (type) {
      case "message":
        return renderMessageSkeleton(inverted);
      case "profile":
        return renderProfileSkeleton();
      case "card":
        return renderCardSkeleton();
      case "post":
        return renderPostSkeleton();
      case "header":
        return renderHeaderSkeleton();
      case "list":
        return renderListSkeleton();
      default:
        return renderMessageSkeleton(inverted);
    }
  };

  const renderMessageSkeleton = (inverted: boolean) => {
    const items = [];
    for (let i = 0; i < count; i++) {
      // Alternate between sent and received message skeletons
      const isSent = i % 2 === 0;
      items.push(
        <View
          key={`message-${i}`}
          style={[
            styles.messageItem,
            isSent ? styles.sentMessage : styles.receivedMessage,
          ]}
        >
          {!isSent && (
            <Skeleton
              type="avatar"
              shape="circle"
              width={36}
              height={36}
              style={styles.messageAvatar}
            />
          )}
          <View
            style={[
              styles.messageContent,
              isSent ? styles.sentContent : styles.receivedContent,
            ]}
          >
            <Skeleton
              width={isSent ? 180 : 220}
              height={16}
              shape="rounded"
              style={{ marginBottom: 4 }}
            />
            <Skeleton width={isSent ? 120 : 160} height={16} shape="rounded" />
          </View>
        </View>
      );
    }
    return (
      <View
        style={[
          styles.container,
          { flexDirection: inverted ? "column-reverse" : "column" },
        ]}
      >
        {items}
      </View>
    );
  };

  const renderProfileSkeleton = () => {
    return (
      <View style={styles.profileContainer}>
        <Skeleton
          type="avatar"
          shape="circle"
          width={80}
          height={80}
          style={styles.profileAvatar}
        />
        <Skeleton width={180} height={24} style={styles.profileName} />
        <Skeleton width={240} height={16} style={styles.profileBio} />
        <Skeleton width={120} height={16} style={styles.profileBio} />

        <View style={styles.profileStats}>
          <Skeleton width={80} height={40} shape="rounded" />
          <Skeleton width={80} height={40} shape="rounded" />
          <Skeleton width={80} height={40} shape="rounded" />
        </View>
      </View>
    );
  };

  const renderCardSkeleton = () => {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(
        <View key={`card-${i}`} style={styles.cardContainer}>
          <Skeleton type="image" height={140} />
          <View style={styles.cardContent}>
            <Skeleton width="85%" height={20} style={styles.cardTitle} />
            <Skeleton width="65%" height={16} style={styles.cardSubtitle} />
            <View style={styles.cardFooter}>
              <Skeleton width={80} height={30} shape="rounded" />
              <Skeleton width={30} height={30} shape="circle" />
            </View>
          </View>
        </View>
      );
    }
    return <View style={styles.container}>{items}</View>;
  };

  const renderPostSkeleton = () => {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(
        <View key={`post-${i}`} style={styles.postContainer}>
          <View style={styles.postHeader}>
            <Skeleton type="avatar" shape="circle" width={40} height={40} />
            <View style={styles.postHeaderText}>
              <Skeleton width={120} height={16} style={styles.postAuthor} />
              <Skeleton width={80} height={12} style={styles.postTimestamp} />
            </View>
            <Skeleton
              width={24}
              height={24}
              shape="circle"
              style={styles.postMore}
            />
          </View>
          <Skeleton type="image" height={200} style={styles.postImage} />
          <View style={styles.postActions}>
            <Skeleton
              width={24}
              height={24}
              shape="circle"
              style={styles.postAction}
            />
            <Skeleton
              width={24}
              height={24}
              shape="circle"
              style={styles.postAction}
            />
            <Skeleton
              width={24}
              height={24}
              shape="circle"
              style={styles.postAction}
            />
            <Skeleton
              width={24}
              height={24}
              shape="circle"
              style={{ marginLeft: "auto" }}
            />
          </View>
          <View style={styles.postCaption}>
            <Skeleton width="100%" height={16} style={styles.captionLine} />
            <Skeleton width="80%" height={16} style={styles.captionLine} />
          </View>
        </View>
      );
    }
    return <View style={styles.container}>{items}</View>;
  };

  const renderHeaderSkeleton = () => {
    return (
      <View style={styles.headerContainer}>
        <Skeleton
          width={40}
          height={40}
          shape="circle"
          style={styles.headerBack}
        />
        <Skeleton width={160} height={24} style={styles.headerTitle} />
        <View style={styles.headerActions}>
          <Skeleton
            width={30}
            height={30}
            shape="circle"
            style={styles.headerAction}
          />
          <Skeleton
            width={30}
            height={30}
            shape="circle"
            style={styles.headerAction}
          />
        </View>
      </View>
    );
  };

  const renderListSkeleton = () => {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(
        <View key={`list-${i}`} style={styles.listItem}>
          <Skeleton type="avatar" shape="circle" width={50} height={50} />
          <View style={styles.listContent}>
            <Skeleton width="70%" height={18} style={{ marginBottom: 6 }} />
            <Skeleton width="50%" height={14} />
          </View>
          <Skeleton
            width={40}
            height={40}
            shape="circle"
            style={styles.listAction}
          />
        </View>
      );
    }
    return <View style={styles.container}>{items}</View>;
  };

  return <View style={[styles.container, style]}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "column",
    flex: 1,
  },
  messageItem: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sentMessage: {
    justifyContent: "flex-end",
  },
  receivedMessage: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    marginRight: 8,
  },
  messageContent: {
    padding: 8,
  },
  sentContent: {
    alignItems: "flex-end",
  },
  receivedContent: {
    alignItems: "flex-start",
  },
  profileContainer: {
    alignItems: "center",
    padding: 20,
  },
  profileAvatar: {
    marginBottom: 16,
  },
  profileName: {
    marginBottom: 12,
  },
  profileBio: {
    marginBottom: 6,
  },
  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardSubtitle: {
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  postContainer: {
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  postHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  postAuthor: {
    marginBottom: 4,
  },
  postTimestamp: {},
  postMore: {
    marginLeft: 8,
  },
  postImage: {
    marginBottom: 8,
  },
  postActions: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  postAction: {
    marginRight: 16,
  },
  postCaption: {
    padding: 12,
    paddingTop: 0,
  },
  captionLine: {
    marginBottom: 4,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerBack: {},
  headerTitle: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerAction: {
    marginLeft: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
  listAction: {
    marginLeft: 8,
  },
});

export default SkeletonUI;
