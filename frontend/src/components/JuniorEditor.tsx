import React from "react";
import { Junior } from "@bitbloq/junior";
import {
  bloqTypes,
  eventBloqGroups,
  actionBloqGroups,
  waitBloqGroups,
  boards,
  components
} from "../config";
import { EditorProps } from "../types";

const JuniorEditor: React.FunctionComponent<EditorProps> = ({
  content,
  onContentChange,
  brandColor,
  tabIndex,
  onTabChange,
  getTabs,
  title,
  onEditTitle,
  canEditTitle
}) => {
  return (
    <Junior
      brandColor={brandColor}
      tabIndex={tabIndex}
      onTabChange={onTabChange}
      title={title}
      onEditTitle={onEditTitle}
      canEditTitle={canEditTitle}
      bloqTypes={bloqTypes}
      eventBloqGroups={eventBloqGroups}
      actionBloqGroups={actionBloqGroups}
      waitBloqGroups={waitBloqGroups}
      initialContent={content || {}}
      onContentChange={onContentChange}
      boards={boards}
      components={components}
    >
      {getTabs}
    </Junior>
  );
};

export default JuniorEditor;
