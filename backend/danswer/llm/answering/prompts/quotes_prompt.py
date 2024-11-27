from danswer.chat.models import LlmDoc
from danswer.configs.chat_configs import LANGUAGE_HINT
from danswer.context.search.models import InferenceChunk
from danswer.db.search_settings import get_multilingual_expansion
from danswer.llm.answering.models import PromptConfig
from danswer.llm.utils import message_to_prompt_and_imgs
from danswer.prompts.direct_qa_prompts import CONTEXT_BLOCK, HISTORY_BLOCK, JSON_PROMPT
from danswer.prompts.prompt_utils import (
    add_date_time_to_prompt,
    add_employee_context_to_prompt,
    build_complete_context_str,
)
from langchain.schema.messages import HumanMessage


def _build_strong_llm_quotes_prompt(
    question: str,
    context_docs: list[LlmDoc] | list[InferenceChunk],
    history_str: str,
    prompt: PromptConfig,
    user_email: str,
) -> HumanMessage:
    use_language_hint = bool(get_multilingual_expansion())

    context_block = ""
    if context_docs:
        context_docs_str = build_complete_context_str(context_docs)
        context_block = CONTEXT_BLOCK.format(context_docs_str=context_docs_str)

    history_block = ""
    if history_str:
        history_block = HISTORY_BLOCK.format(history_str=history_str)

    full_prompt = JSON_PROMPT.format(
        system_prompt=prompt.system_prompt,
        context_block=context_block,
        history_block=history_block,
        task_prompt=prompt.task_prompt,
        user_query=question,
        language_hint_or_none=LANGUAGE_HINT.strip() if use_language_hint else "",
    ).strip()

    if prompt.datetime_aware:
        full_prompt = add_date_time_to_prompt(prompt_str=full_prompt)

    if user_email:
        full_prompt = add_employee_context_to_prompt(
            prompt_str=full_prompt, user_email=user_email
        )

    return HumanMessage(content=full_prompt)


def build_quotes_user_message(
    message: HumanMessage,
    context_docs: list[LlmDoc] | list[InferenceChunk],
    history_str: str,
    prompt: PromptConfig,
    user_email: str,
) -> HumanMessage:
    query, _ = message_to_prompt_and_imgs(message)

    return _build_strong_llm_quotes_prompt(
        question=query,
        context_docs=context_docs,
        history_str=history_str,
        prompt=prompt,
        user_email=user_email,
    )
